const mongoose = require("mongoose");

// this is just a clean reusable object for string fields yk
const str = (req = false) => ({
  type: String,
  required: req,
  trim: true,
});

// schema time – define how our Project model looks
const ProjectSchema = new mongoose.Schema(
  {
    // project id, not mongo's dumb _id, this is OUR id yk
    projectId: str(true),

    // who owns this project
    ownerId: str(true),

    // name of the project
    name: str(true),

    // description, long ass text if needed
    description: {
      type: String,
      default: "",
    },

    // status so we know if the guy is active, paused, dead, etc
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },

    // random settings object cus every project has that one random ass config
    settings: {
      type: Object,
      default: {},
    },

    // list of people in the project
    members: {
      type: [String],
      default: [],
    },

    // tags yk for searching n filtering
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically, thank god
  }
);

// INDEXES cus performance matters when stuff scales
ProjectSchema.index({ projectId: 1 }); // fast lookup for our own custom id
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ tags: 1 });

// METHODS – stuff u call on an instance, like project.addMember("123")
ProjectSchema.methods.addMember = function (userId) {
  // adds them if not already in
  if (!this.members.includes(userId)) this.members.push(userId);
  return this.save();
};

// STATIC – stuff u call on the model itself
ProjectSchema.statics.findByOwner = function (ownerId) {
  // find all projects owned by owner
  return this.find({ ownerId });
};

// VIRTUAL – fake field that doesn’t get stored, but still cool
ProjectSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

module.exports = mongoose.model("Project", ProjectSchema);
