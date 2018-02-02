import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', () => Tasks.find({
    $or: [
      { private: { $ne: true} },
      { owner: Meteor.userId() }
    ]
  }));
}

Meteor.methods({
  'tasks.insert': text => {
    check(text, String);
    const userId = Meteor.userId();
    // Make sure the user is logged in before inserting a task
    if (!userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: userId,
      username: Meteor.users.findOne(userId).username
    });
  },
  'tasks.remove': taskId => {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.remove(taskId);
  },
  'tasks.setChecked': (taskId, setChecked) => {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, { $set: { checked: setChecked } });
  },
  'tasks.setPrivate': (taskId, setToPrivate) => {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);
    const userId = Meteor.userId();
    // Make sure only the task owner can make a task private
    if (task.owner !== userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

export default Tasks;
