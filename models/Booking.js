const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔗 Reference to user who made the booking
      required: true,
    },

    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    guests: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    customPlan: [
      {
        date: {
          type: String,
          required: true,
        },

        Hotel: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
          },
          name: {
            type: String,
          },
          perDay: {
            type: Number,
          },
        },

        places: [
          {
            placeId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Place",
            },
            place: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              default: 0,
            },
            timeSlot: {
              type: String,
              enum: ["morning", "afternoon", "evening"],
            },
          },
        ],
      },
    ],

    carRental: {
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CarRental",
      },
      model: {
        type: String,
      },
      providerContact: {
        type: String,
      },
      perDay: {
        type: Number,
      },
    },

    totalCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
