import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
const config = require('./config.js');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: '',
      textbox: '',
      customFields: [],
      checked: []
    };
  }

  setKey = (event) => {
    this.setState({textbox: event.target.value});
  }

  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      this.handleFind(event);
    }
  }

  handleFind = (e) => {
    e.preventDefault();
    if (this.state.textbox) {
      this.setState({apiKey : this.state.textbox}, () => {
        this.fetchFields();
      });
    }
  }

  fetchSavedSettings = () => {
    axios.post(config.savedFieldsURL, {
        apiKey: this.state.apiKey
      })
    .then(response => {
      let checked = this.state.checked || [];
      let checkbox;
      let x;
      response.data.forEach( (savedField) => {
        checkbox = checked.find(({name})=> name === savedField);

        if (!checkbox) {
          checked.push({name: savedField, checked: true});
          x = document.getElementById(`${savedField}`);
          x.checked = true;
        } else {
          checkbox.checked = true;
        }

        this.setState({ checked });
      })
    })
    .catch(err => {
      alert('Could not fetch retrieve saved settings. Please check your API key.');
      console.log(err, 'Could not retrieve settings');
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // only store the field if checked === true
    let checkedFields = this.state.checked.filter(({checked})=> checked).map(({name})=>name);

    axios.post(config.settingsURL, {
        fieldsToSave: checkedFields,
        apiKey: this.state.apiKey
      })
    .then(response => {
      alert('Settings saved.');
    })
    .catch(err => {
      console.log(err, 'Could not save settings');
      alert('There was a problem. Settings could not be saved.');
    });
  }

  handleCheckboxChange = (e) => {
    // dynamically update state object when checkbox is clicked/unclicked
    let checked = this.state.checked || [];
    let checkbox = checked.find(({name})=> name === e.target.id);

    if (!checkbox) {
      checked.push({name: e.target.id, checked: e.target.checked});
    } else {
      checkbox.checked = e.target.checked;
    }

    this.setState({ checked })
  }

  fetchFields = () => {

    axios.post(config.customFieldsURL, {
        apiKey: this.state.apiKey
      })
      .catch(err => {
        console.log(err, 'Could not fetch custom fields');
      })
      .then(response => {
        if (response && response.data) {
          this.setState({customFields: response.data});
          response.data.forEach( (customField) => {
            this.setState({ [customField.replace(/ /g, "")]: false });
          })
        }
        this.fetchSavedSettings();
    })
  }

renderDefaultFields = () => {
  if (!this.state.apiKey) {
    return '';
  }

  return (
    <div>
      <h5>Standard Fields</h5>
      <div>
        <label key="Name"><input id="Name" key="Email" type="checkbox" checked={this.state.name} onChange={e => this.handleCheckboxChange(e)} />Name</label><br />
        <label key="Email"><input id="Email" key="Email" type="checkbox" checked={this.state.email} onChange={e => this.handleCheckboxChange(e)} />Email</label><br />
        <label key="First Name"><input id="FirstName" key="First Name" type="checkbox" checked={this.state.firstName} onChange={e => this.handleCheckboxChange(e)} />First Name</label><br />
        <label key="Last Name"><input id="LastName" key="Last Name" type="checkbox" checked={this.state.lastName} onChange={e => this.handleCheckboxChange(e)} />Last Name</label><br />
        <label key="Salutation"><input id="Salutation" key="Salutation" type="checkbox" checked={this.state.salutation} onChange={e => this.handleCheckboxChange(e)} />Salutation</label><br />
        <label key="Company"><input id="Company" key="Company" type="checkbox" checked={this.state.company} onChange={e => this.handleCheckboxChange(e)} />Company</label><br />
        <label key="Title"><input id="Title" key="Title" type="checkbox" checked={this.state.title} onChange={e => this.handleCheckboxChange(e)} />Title</label><br />
        <label key="Industry"><input id="Industry" key="Industry" type="checkbox" checked={this.state.industry} onChange={e => this.handleCheckboxChange(e)} />Industry</label><br />
        <label key="Phone"><input id="Phone" key="Phone" type="checkbox" checked={this.state.phone} onChange={e => this.handleCheckboxChange(e)} />Phone</label><br />
        <label key="Mobile"><input id="MobilePhone" key="Mobile" type="checkbox" checked={this.state.mobile} onChange={e => this.handleCheckboxChange(e)} />Mobile</label><br />
        <label key="Fax"><input id="Fax" key="Fax" type="checkbox" checked={this.state.fax} onChange={e => this.handleCheckboxChange(e)} />Fax</label><br />
        <label key="Website"><input id="Website" key="Website" type="checkbox" checked={this.state.website} onChange={e => this.handleCheckboxChange(e)} />Website</label><br />
        <label key="Mailing Street"><input id="MailingStreet" key="Mailing Street" checked={this.state.mailingStreet} type="checkbox" onChange={e => this.handleCheckboxChange(e)} />Mailing Street</label><br />
        <label key="Mailing City"><input id="MailingCity" key="Mailing City" type="checkbox" checked={this.state.mailingCity} onChange={e => this.handleCheckboxChange(e)} />Mailing City</label><br />
        <label key="Mailing State"><input id="MailingState" key="Mailing State" type="checkbox" checked={this.state.mailingState} onChange={e => this.handleCheckboxChange(e)} />Mailing State</label><br />
        <label key="Mailing Postal Code"><input id="MailingPostalCode" key="Mailing Postal Code" type="checkbox" checked={this.state.mailingPostalCode} onChange={e => this.handleCheckboxChange(e)} />Mailing Postal Code</label><br />
        <label key="Mailing Country"><input id="MailingCountry" key="Mailing Country" type="checkbox" checked={this.state.mailingCountry} onChange={e => this.handleCheckboxChange(e)} />Mailing Country</label><br />
        <label key="Lead Owner"><input id="LeadOwner" key="Lead Owner" type="checkbox" checked={this.state.leadOwner} onChange={e => this.handleCheckboxChange(e)} />Lead Owner</label><br />
        <label key="Lead Source"><input id="LeadSource" key="Lead Source" type="checkbox" checked={this.state.leadSource} onChange={e => this.handleCheckboxChange(e)} />Lead Source</label><br />
        <label key="Lead Status"><input id="Status" key="Lead Status" type="checkbox" checked={this.state.leadStatus} onChange={e => this.handleCheckboxChange(e)} />Lead Status</label><br />
        <label key="Twitter"><input id="Twitter" key="Twitter" type="checkbox" checked={this.state.twitter} onChange={e => this.handleCheckboxChange(e)} />Twitter</label><br />
        <label key="LinkedIn"><input id="LinkedIn" key="LinkedIn" type="checkbox" checked={this.state.linkedIn} onChange={e => this.handleCheckboxChange(e)} />LinkedIn</label><br />
        <label key="Created At"><input id="created_at" key="Created At" type="checkbox" checked={this.state.created_at} onChange={e => this.handleCheckboxChange(e)} />Created At</label><br />
        <label key="Updated At"><input id="updated_at" key="Updated At" type="checkbox" checked={this.state.updated_at} onChange={e => this.handleCheckboxChange(e)} />Updated At</label><br />
      </div>
    </div>
  );
}

  renderCustomFields = () => {
    if (this.state.customFields.length === 0) {
      return '';
    }

    const customFields = this.state.customFields.map((customField) => (
      <div key={customField}>
        <label>
          <input id={customField.replace(/ /g, "")} type="checkbox" onChange={e => this.handleCheckboxChange(e)} />
          {customField}
        </label>
        <br/>
      </div>
    ))

    return (
      <div>
        <h5>Custom Fields</h5>
        {customFields}
      </div>
    )
  }

  render() {

    return (
      <div id="settingsPanel">
        <div id="searchContainer">
          <form>
            <label id="api-label">
            API Key
            <input
              className="searchInput"
              placeholder="Enter API Key"
              pattern=".{1,}" required title="1 character minimum"
              ref={(input) => { this.searchBar = input }}
              value={this.state.textbox}
              onKeyPress={this.handleKeyPress}
              onChange={this.setKey}
            />
            </label>
            <button
            className="searchButton"
            onClick={this.handleFind}>
              Find Fields
            </button>
          </form>
        </div>
        <form>
          <div id="fields">
          <div>
            {this.renderDefaultFields()}
            {this.renderCustomFields()}

            {(this.state.apiKey) ? <button
            className="submitButton"
            onClick={this.handleSubmit}>
              Submit Preferences
            </button>
            : ""}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
