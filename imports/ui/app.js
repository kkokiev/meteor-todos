import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import AccountsUIWrapper from './accounts-ui-wrapper';
import Tasks from '../api/tasks';
import Task from './task';

// App component - represents the whole app
class App extends Component {
  state = {
    hideCompleted: false
  }

  toggleHideCompleted = () => {
    this.setState({ hideCompleted: !this.state.hideCompleted })
  }

  handleSubmit = e => {
    e.preventDefault();
    const text = this.tasksInput.value;
    
    Meteor.call('tasks.insert', text);

    this.tasksInput.value = '';
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>
        </header>

        <label className="hide-completed">
          <input
            type="checkbox"
            readOnly
            checked={this.state.hideCompleted}
            onClick={this.toggleHideCompleted}
          />
          Hide Completed Tasks
        </label>

        <AccountsUIWrapper />
        
        {this.props.currentUser &&
          <form className="new-task" onSubmit={this.handleSubmit} >
            <input
              type="text"
              ref={input => (this.tasksInput = input)}
              placeholder="Type to add new tasks"
            />
          </form>
        }

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1} }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  }
})(App);
