const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  alertId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^ALT-\d{4}-\d{6}$/
    }
  },
  touristId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tourists',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'emergency',
      'panic',
      'medical',
      'location',
      'device',
      'geofence',
      'weather',
      'security',
      'system',
      'maintenance'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'false_alarm', 'escalated'),
    defaultValue: 'active'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {
      source: 'system',
      confidence: 80,
      tags: [],
      priority: 5
    }
  },
  response: {
    type: DataTypes.JSONB,
    defaultValue: {
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedBy: null,
      resolvedAt: null,
      resolution: null,
      actions: []
    }
  },
  notifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      sent: [],
      escalation: {
        level: 1,
        escalatedAt: null,
        escalatedTo: []
      }
    }
  },
  timeline: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  hooks: {
    beforeCreate: async (alert) => {
      if (!alert.alertId) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900000) + 100000;
        alert.alertId = `ALT-${year}-${randomNum}`;
      }
      
      // Add to timeline
      alert.timeline = [{
        timestamp: new Date(),
        event: 'created',
        description: 'Alert created',
        data: {
          type: alert.type,
          severity: alert.severity
        }
      }];
    }
  }
});

// Instance methods
Alert.prototype.acknowledge = async function(userId, notes = '') {
  this.status = 'acknowledged';
  this.response.acknowledgedBy = userId;
  this.response.acknowledgedAt = new Date();
  
  this.timeline.push({
    timestamp: new Date(),
    event: 'acknowledged',
    description: notes || 'Alert acknowledged',
    user: userId
  });
  
  return this.save();
};

Alert.prototype.resolve = async function(userId, resolution, notes = '') {
  this.status = 'resolved';
  this.response.resolvedBy = userId;
  this.response.resolvedAt = new Date();
  this.response.resolution = resolution;
  
  this.timeline.push({
    timestamp: new Date(),
    event: 'resolved',
    description: notes || 'Alert resolved',
    user: userId,
    data: { resolution }
  });
  
  return this.save();
};

Alert.prototype.escalate = async function(escalatedTo, reason = '') {
  this.notifications.escalation.level += 1;
  this.notifications.escalation.escalatedAt = new Date();
  this.notifications.escalation.escalatedTo.push(...escalatedTo);
  
  this.timeline.push({
    timestamp: new Date(),
    event: 'escalated',
    description: reason || 'Alert escalated',
    data: { 
      level: this.notifications.escalation.level,
      escalatedTo: escalatedTo
    }
  });
  
  return this.save();
};

Alert.prototype.addAction = async function(action, userId, notes = '') {
  this.response.actions.push({
    action,
    performedBy: userId,
    performedAt: new Date(),
    notes
  });
  
  this.timeline.push({
    timestamp: new Date(),
    event: 'action_taken',
    description: notes || `Action: ${action}`,
    user: userId,
    data: { action }
  });
  
  return this.save();
};

Alert.prototype.markFalseAlarm = async function(userId, reason = '') {
  this.status = 'false_alarm';
  this.response.resolvedBy = userId;
  this.response.resolvedAt = new Date();
  this.response.resolution = reason || 'Marked as false alarm';
  
  this.timeline.push({
    timestamp: new Date(),
    event: 'false_alarm',
    description: reason || 'Alert marked as false alarm',
    user: userId
  });
  
  return this.save();
};

// Virtual fields
Object.defineProperty(Alert.prototype, 'age', {
  get: function() {
    return Date.now() - this.createdAt.getTime();
  }
});

Object.defineProperty(Alert.prototype, 'responseTime', {
  get: function() {
    if (!this.response?.acknowledgedAt) return null;
    return this.response.acknowledgedAt.getTime() - this.createdAt.getTime();
  }
});

Object.defineProperty(Alert.prototype, 'resolutionTime', {
  get: function() {
    if (!this.response?.resolvedAt) return null;
    return this.response.resolvedAt.getTime() - this.createdAt.getTime();
  }
});

// Static methods
Alert.findActive = function() {
  return this.findAll({ where: { status: 'active', isActive: true } });
};

Alert.findBySeverity = function(severity) {
  return this.findAll({ where: { severity, isActive: true } });
};

Alert.findByType = function(type) {
  return this.findAll({ where: { type, isActive: true } });
};

Alert.findByTourist = function(touristId) {
  return this.findAll({ where: { touristId, isActive: true } });
};

Alert.findCritical = function() {
  return this.findAll({ 
    where: { 
      severity: 'critical', 
      status: { [sequelize.Op.in]: ['active', 'acknowledged'] },
      isActive: true 
    } 
  });
};

Alert.findNeedingAttention = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Op.in]: ['active', 'acknowledged'] },
      severity: { [sequelize.Op.in]: ['high', 'critical'] },
      isActive: true
    }
  });
};

// Indexes are defined in the model definition above

module.exports = Alert;