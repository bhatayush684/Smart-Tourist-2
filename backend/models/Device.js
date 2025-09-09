const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[A-Z]{2}-\d{3}-\d{4}$/
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
  deviceType: {
    type: DataTypes.ENUM('smartband', 'tracker', 'phone', 'watch', 'beacon'),
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firmwareVersion: {
    type: DataTypes.STRING,
    defaultValue: '1.0.0'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'warning', 'offline', 'maintenance'),
    defaultValue: 'active'
  },
  batteryLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  signalStrength: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  lastUpdate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  vitals: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  sensors: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  alerts: {
    type: DataTypes.JSONB,
    defaultValue: {
      batteryLow: false,
      signalWeak: false,
      heartRateAbnormal: false,
      temperatureAbnormal: false,
      fallDetected: false,
      panicButtonPressed: false,
      geofenceViolation: false
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      dataTransmissionInterval: 30,
      batteryOptimization: true,
      emergencyMode: false,
      silentMode: false,
      autoSOS: {
        enabled: true,
        triggerConditions: []
      }
    }
  },
  connectivity: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  maintenance: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  statistics: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalUptime: 0,
      dataTransmitted: 0,
      alertsGenerated: 0,
      emergencyCalls: 0,
      batteryCycles: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'devices',
  timestamps: true,
  hooks: {
    beforeCreate: async (device) => {
      if (!device.deviceId) {
        const typeCode = device.deviceType.substring(0, 2).toUpperCase();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const year = new Date().getFullYear().toString().substring(2);
        device.deviceId = `${typeCode}-${randomNum}-${year}`;
      }
    }
  }
});

// Instance methods
Device.prototype.updateVitals = async function(vitalsData) {
  Object.keys(vitalsData).forEach(key => {
    if (this.vitals[key] !== undefined) {
      this.vitals[key] = vitalsData[key];
    }
  });
  
  this.lastUpdate = new Date();
  return this.save();
};

Device.prototype.updateLocation = async function(locationData) {
  this.location = {
    ...this.location,
    ...locationData,
    timestamp: new Date()
  };
  
  this.lastUpdate = new Date();
  return this.save();
};

Device.prototype.triggerAlert = async function(alertType, data = {}) {
  if (this.alerts[alertType] !== undefined) {
    this.alerts[alertType] = true;
  }
  
  this.statistics.alertsGenerated += 1;
  this.lastUpdate = new Date();
  
  return this.save();
};

Device.prototype.clearAlert = async function(alertType) {
  if (this.alerts[alertType] !== undefined) {
    this.alerts[alertType] = false;
  }
  
  this.lastUpdate = new Date();
  return this.save();
};

Device.prototype.needsMaintenance = function() {
  if (!this.maintenance?.nextMaintenance) return false;
  return new Date() >= this.maintenance.nextMaintenance;
};

// Virtual fields
Object.defineProperty(Device.prototype, 'healthScore', {
  get: function() {
    let score = 100;
    
    // Battery level impact
    if (this.batteryLevel < 20) score -= 30;
    else if (this.batteryLevel < 50) score -= 15;
    
    // Signal strength impact
    if (this.signalStrength < 30) score -= 25;
    else if (this.signalStrength < 60) score -= 10;
    
    // Status impact
    if (this.status === 'offline') score -= 50;
    else if (this.status === 'warning') score -= 20;
    else if (this.status === 'maintenance') score -= 10;
    
    // Alert impact
    const alertCount = Object.values(this.alerts).filter(alert => alert === true).length;
    score -= alertCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }
});

Object.defineProperty(Device.prototype, 'timeSinceLastUpdate', {
  get: function() {
    if (!this.lastUpdate) return null;
    return Date.now() - this.lastUpdate.getTime();
  }
});

// Static methods
Device.findByStatus = function(status) {
  return this.findAll({ where: { status, isActive: true } });
};

Device.findByType = function(deviceType) {
  return this.findAll({ where: { deviceType, isActive: true } });
};

Device.findLowBattery = function(threshold = 20) {
  return this.findAll({ 
    where: { 
      batteryLevel: { [sequelize.Op.lt]: threshold }, 
      isActive: true 
    } 
  });
};

Device.findOffline = function(minutes = 30) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.findAll({ 
    where: { 
      lastUpdate: { [sequelize.Op.lt]: cutoffTime }, 
      isActive: true 
    } 
  });
};

// Indexes are defined in the model definition above

module.exports = Device;