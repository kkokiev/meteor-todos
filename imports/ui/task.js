import React, { Component } from 'react';

import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

import Tasks from '../api/tasks';

class Task extends Component {
  toggleChecked = () => {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  togglePrivate = () => {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  deleteThisTask = () => {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  render() {
    const { task } = this.props;

    const taskClassName = classnames({
      checked: task.checked,
      private: task.private,
    });

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask}>&times;</button>

        <input
          type="checkbox"
          readOnly
          checked={!!this.props.task.checked}
          onClick={this.toggleChecked}
        />

        {this.props.showPrivateButton &&
          <button className="toggle-private" onClick={this.togglePrivate}>
            { task.private ? 'Private' : 'Public' }
          </button>
        }

        <span className="text">
          <strong>{task.username}</strong>: {task.text}
        </span>
      </li>
    );
  }
}

export default Task;
