import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Lab from '../models/Lab.js';
import Practical from '../models/Practical.js';
await mongoose.connect(process.env.MONGO_URI);
try {
  const labChanges = [{
    match: {
      labName: 'DBMS Lab',
      subject: 'Database Management Systems'
    },
    update: {
      labName: 'OOAD Lab',
      subject: 'OOAD'
    }
  }, {
    match: {
      labName: 'Web Technology Lab',
      subject: 'Web Technologies'
    },
    update: {
      labName: 'MM Lab',
      subject: 'MM'
    }
  }, {
    match: {
      labName: 'Data Analytics Lab',
      subject: 'Data Analytics'
    },
    update: {
      labName: 'OOAD Lab',
      subject: 'OOAD'
    }
  }];
  const practicalChanges = [{
    match: {
      title: 'SQL Query Exercises',
      subject: 'Database Management Systems'
    },
    update: {
      title: 'OOAD Use Case and Class Diagram',
      subject: 'OOAD',
      description: 'Model a simple college registration system.'
    }
  }, {
    match: {
      title: 'Responsive Student Portal',
      subject: 'Web Technologies'
    },
    update: {
      title: 'MM Image and Audio Editing',
      subject: 'MM',
      description: 'Create a small multimedia composition using image and audio assets.'
    }
  }, {
    match: {
      title: 'Exploratory Data Analysis',
      subject: 'Data Analytics'
    },
    update: {
      title: 'OOAD Sequence Diagram',
      subject: 'OOAD',
      description: 'Show the interaction flow for a student lab booking.'
    }
  }];
  for (const change of labChanges) {
    await Lab.updateOne(change.match, {
      $set: change.update
    });
  }
  for (const change of practicalChanges) {
    await Practical.updateOne(change.match, {
      $set: change.update
    });
  }
  await User.updateOne({
    email: 'admin@iips.edu',
    role: 'admin'
  }, {
    $set: {
      semester: '9',
      branch: 'MCA'
    }
  });
  console.log('Demo scope updated for semester 9 MCA OOAD and MM. No records were deleted.');
} finally {
  await mongoose.disconnect();
}
