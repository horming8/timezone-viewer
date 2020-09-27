import React, { Component, Fragment } from 'react'

import ct from 'countries-and-timezones'
import moment from 'moment'
import 'moment-timezone'

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { Box, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { DataGrid } from '@material-ui/data-grid';

class App extends Component {
  constructor() {
    super()
    this.state = {
      currentTime: moment(),
      inputCountryId: '',
      inputCountryName: '',
      inputTimezone: '',
    }

    this.clocks = []
    this.countries = {}
    this.countryOptions = []
  }

  componentDidMount(prop, state) {
    this.countries = ct.getAllCountries()

    // convert timezones array of string to array of object
    for (let c in this.countries) {
      let { timezones } = this.countries[c];
      let timezoneOptions = []
      timezones.forEach((value, index) => {
        timezoneOptions[index] = { timezone: value };
      })
      timezoneOptions.sort((left, right) => (left.timezone > right.timezone) ? 1 : -1)
      this.countries[c].timezones = timezoneOptions;
    }

    // create an array for country autocompletion
    let i = 0
    for (let c in this.countries) {
      this.countryOptions[i++] = this.countries[c];
    }
    this.countryOptions.sort((left, right) => (left.name > right.name) ? 1 : -1)

    // update the timezones per second
    this.tick = setInterval(() => this.setState({
      currentTime: moment()
    }), 1000)
  }

  componentWillUnmount(prop, state) {
    clearInterval(this.tick)
  }

  handleChangeCountry = (event, value) => {
    if (value)
      this.setState({
        inputCountryId: value.id,
        inputCountryName: value.name
      })
  }

  handleChangeTimezone = (event, value) => {
    if (value)
      this.setState({ inputTimezone: value })
  }

  handleAddTimezone = () => {
    const { inputCountryId, inputCountryName, inputTimezone } = this.state;

    if (inputCountryId && inputTimezone) {
      const newKey = [inputCountryId, inputCountryName, inputTimezone.timezone].join('-')
      if (!this.clocks.includes(newKey)) {
        this.clocks[newKey] = {
          code: inputCountryId,
          country: inputCountryName,
          timezone: inputTimezone.timezone,
          date: this.state.currentTime.tz(inputTimezone.timezone).format('L'),
          time: this.state.currentTime.tz(inputTimezone.timezone).format('LTS')
        }
      }
    }
  }

  render() {
    const timezones = Object.entries(this.clocks).map((c) => {
      let { timezone } = c[1]
      let date = this.state.currentTime.tz(timezone).format('L')
      let time = this.state.currentTime.tz(timezone).format('LTS')
      return {
        id: c[0],
        code: c[1].code,
        country: c[1].country,
        timezone: c[1].timezone,
        date: date,
        time: time,
      }
    })

    return (
      <Fragment>
        <Box display='flex' justifyContent='center' alignItems='center'>
          <Autocomplete
            size='small'
            style={{ width: 300 }}
            options={this.countryOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label='Country' variant='outlined' />}
            onChange={this.handleChangeCountry}
          />
          <Autocomplete
            size='small'
            style={{ width: 300 }}
            options={this.state.inputCountryId ? this.countries[this.state.inputCountryId].timezones : []}
            getOptionLabel={(option) => option.timezone}
            renderInput={(params) => <TextField {...params} label='Timezone' variant='outlined' />}
            onChange={this.handleChangeTimezone}
          />
          <Fab
            size='small'
            color='primary'
            aria-label='add'
            onClick={this.handleAddTimezone}
          >
            <AddIcon />
          </Fab>
        </Box>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            columns={[
              { field: 'code' },
              { field: 'country', width: 300 },
              { field: 'timezone', width: 300 },
              { field: 'date', width: 150 },
              { field: 'time', width: 150 },
            ]}
            rows={timezones}
          />
          </div>
      </Fragment >
    )
  }
}

export default App
