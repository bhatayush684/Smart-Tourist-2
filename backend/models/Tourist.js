const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tourist = sequelize.define('Tourist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  touristId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^TST-\d{4}-[A-Z]{3}-\d{4}$/
    }
  },
  personalInfo: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  travelInfo: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  safetyScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'missing', 'emergency', 'safe'),
    defaultValue: 'active'
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low'
  },
  healthInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  digitalId: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  digitalIdCards: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      language: 'en',
      notifications: {
        emergency: true,
        location: true,
        weather: true,
        safety: true
      },
      privacy: {
        shareLocation: true,
        shareHealthData: false
      }
    }
  },
  statistics: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalDistanceTraveled: 0,
      totalTimeSpent: 0,
      alertsTriggered: 0,
      emergencyCalls: 0,
      lastActivity: new Date()
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tourists',
  timestamps: true,
  hooks: {
    beforeCreate: async (tourist) => {
      if (!tourist.touristId) {
        const year = new Date().getFullYear();
        const countryCode = tourist.personalInfo?.nationality?.substring(0, 3).toUpperCase() || 'UNK';
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        tourist.touristId = `TST-${year}-${countryCode}-${randomNum}`;
      }
    }
  }
});

// Instance methods
Tourist.prototype.updateLocation = async function(coordinates, address, accuracy = null) {
  const currentLocation = this.location?.current;
  
  // Add current location to history
  if (currentLocation?.coordinates?.coordinates?.length > 0) {
    if (!this.location.history) this.location.history = [];
    this.location.history.push({
      coordinates: currentLocation.coordinates,
      address: currentLocation.address,
      timestamp: currentLocation.timestamp,
      accuracy: currentLocation.accuracy
    });
  }
  
  // Update current location
  this.location = {
    ...this.location,
    current: {
      coordinates: {
        type: 'Point',
        coordinates: coordinates
      },
      address: address,
      timestamp: new Date(),
      accuracy: accuracy
    }
  };
  
  this.lastSeen = new Date();
  return this.save();
};

Tourist.prototype.calculateSafetyScore = function() {
  let score = 100;
  
  // Reduce score based on risk factors
  if (this.riskLevel === 'high') score -= 30;
  else if (this.riskLevel === 'medium') score -= 15;
  
  // Reduce score for inactive status
  if (this.status === 'missing') score -= 50;
  else if (this.status === 'emergency') score -= 80;
  
  // Reduce score for recent alerts
  if (this.statistics?.alertsTriggered > 0) {
    score -= Math.min(this.statistics.alertsTriggered * 5, 30);
  }
  
  // Ensure score is within bounds
  this.safetyScore = Math.max(0, Math.min(100, score));
  return this.safetyScore;
};

// Virtual fields
Object.defineProperty(Tourist.prototype, 'fullName', {
  get: function() {
    return `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
  }
});

Object.defineProperty(Tourist.prototype, 'age', {
  get: function() {
    if (!this.personalInfo?.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
});

Object.defineProperty(Tourist.prototype, 'travelDuration', {
  get: function() {
    if (!this.travelInfo?.arrivalDate || !this.travelInfo?.departureDate) return null;
    const arrival = new Date(this.travelInfo.arrivalDate);
    const departure = new Date(this.travelInfo.departureDate);
    return Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
  }
});

// Static methods
Tourist.findByStatus = function(status) {
  return this.findAll({ where: { status, isActive: true } });
};

Tourist.findByRiskLevel = function(riskLevel) {
  return this.findAll({ where: { riskLevel, isActive: true } });
};

// Indexes are defined in the model definition above

module.exports = Tourist;