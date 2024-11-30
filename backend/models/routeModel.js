const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  startLocation: {
    type: {
      coordinates: {
        type: [Number],
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    required: true
  },
  endLocation: {
    type: {
      coordinates: {
        type: [Number],
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  fare: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
