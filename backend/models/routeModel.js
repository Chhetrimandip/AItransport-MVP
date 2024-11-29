const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: {
      type: String,
      required: true,
      enum: ['bus', 'train', 'taxi']
    },
    capacity: {
      type: Number,
      required: true
    },
    vehicleNumber: String
  },
  schedule: {
    departureTime: {
      type: Date,
      required: true
    },
    estimatedArrivalTime: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  fare: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  }
}, {
  timestamps: true
});

// Create geospatial indexes
routeSchema.index({ "startLocation.coordinates": "2dsphere" });
routeSchema.index({ "endLocation.coordinates": "2dsphere" });
routeSchema.index({ "currentLocation.coordinates": "2dsphere" });

module.exports = mongoose.model('Route', routeSchema);
