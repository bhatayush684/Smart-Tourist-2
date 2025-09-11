const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('tourist', 'admin', 'police', 'id_issuer'),
    defaultValue: 'tourist',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'suspended'),
    defaultValue: 'active'
  },
  // Additional fields for police officers
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  badgeNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Additional fields for ID issuers
  idType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Approval workflow fields
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      theme: 'auto'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // Set default status based on role
      if (['police', 'id_issuer'].includes(user.role) && !user.status) {
        user.status = 'pending';
      }
    }
  }
});

// Hooks for password hashing
User.addHook('beforeCreate', async (user) => {
  if (user.password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Virtual for account lock status
Object.defineProperty(User.prototype, 'isLocked', {
  get: function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      lockUntil: null,
      loginAttempts: 1
    });
  }
  
  const updates = { loginAttempts: this.loginAttempts + 1 };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }
  
  return this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return this.update({
    loginAttempts: 0,
    lockUntil: null
  });
};

// Static methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email: email.toLowerCase() } });
};

User.findActive = function() {
  return this.findAll({ where: { isActive: true } });
};

User.findByRole = function(role) {
  return this.findAll({ where: { role, isActive: true } });
};

// Override toJSON to remove sensitive data
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.verificationToken;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpires;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

module.exports = User;
