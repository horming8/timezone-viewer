import React, { Fragment, useEffect, useRef, useState } from 'react'

import ct from 'countries-and-timezones'
import moment from 'moment'
import 'moment-timezone'

import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'

import { Box, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { DataGrid } from '@material-ui/data-grid'

const TimezoneViewer = () => {
    const [currentTime, setCurrentTime] = useState(moment())
    const [countries, setCountries] = useState({})
    const [countryOptions, setCountryOptions] = useState([])
    const [updatedTimezones, setUpdatedTimezones] = useState([])

    const [inputCountryId, setInputCountryId] = useState('')
    const [inputCountryName, setInputCountryName] = useState('')
    const [inputTimezone, setInputTimezone] = useState('')

    const timer = useRef(0)
    const userTimezones = useRef([])

    useEffect(() => {
        // convert timezones array of string to array of object
        let countries = ct.getAllCountries()
        for (let c in countries) {
            let { timezones } = countries[c];
            let timezoneOptions = []
            timezones.forEach((value, index) => {
                timezoneOptions[index] = { timezone: value };
            })
            timezoneOptions.sort((left, right) => (left.timezone > right.timezone) ? 1 : -1)
            countries[c].timezones = timezoneOptions;
        }
        setCountries(countries)

        // create an array for country autocompletion
        let countryOptions = []
        let i = 0
        for (let c in countries) {
            countryOptions[i++] = countries[c];
        }
        countryOptions.sort((left, right) => (left.name > right.name) ? 1 : -1)
        setCountryOptions(countryOptions)
        timer.current = setInterval(() => setCurrentTime(moment()), 1000);

        return () => {
            clearInterval(timer.current)
        }
    }, [])

    useEffect(() => {
        updateTimezones()
    }, [currentTime])

    const handleChangeCountry = (event, value) => {
        if (value) {
            setInputCountryId(value.id)
            setInputCountryName(value.name)
            setInputTimezone('')
        }
    }

    const handleChangeTimezone = (event, value) => {
        if (value) {
            setInputTimezone(value.timezone)
        }
    }

    const handleAddTimezone = () => {
        if (inputCountryId && inputTimezone) {
            const newKey = [inputCountryId, inputCountryName, inputTimezone].join('-')
            if (!userTimezones.current.includes(newKey)) {
                userTimezones.current[newKey] = {
                    code: inputCountryId,
                    country: inputCountryName,
                    timezone: inputTimezone,
                    date: currentTime.tz(inputTimezone).format('L'),
                    time: currentTime.tz(inputTimezone).format('LTS')
                }
                // reset user input
                setInputCountryName('')
                setInputTimezone('')
                updateTimezones()
            }
        }
    }

    const updateTimezones = () => {
        let currentTimezones = Object.entries(userTimezones.current).map((tz) => {
            let { timezone } = tz[1]
            let date = currentTime.tz(timezone).format('L')
            let time = currentTime.tz(timezone).format('LTS')
            return {
                id: tz[0],
                code: tz[1].code,
                country: tz[1].country,
                timezone: tz[1].timezone,
                date: date,
                time: time,
            }
        })
        setUpdatedTimezones(currentTimezones)
    }

    return (
        <Fragment>
            <Box
                textAlign='center' fontSize='h4.fontSize'
                mx={-1} mt={-1} boxShadow={3}
                bgcolor='primary.main' color='primary.contrastText'
            >
                Timezone Viewer
            </Box>
            <Box display='flex' justifyContent='center'>
                <Box m={'10px'}>
                    <Autocomplete size='small' style={{ width: 300 }}
                        options={countryOptions}
                        getOptionLabel={(option) => option.name}
                        onChange={handleChangeCountry}
                        inputValue={inputCountryName}
                        renderInput={(params) => <TextField {...params} label='Country' variant='outlined' />}
                    />
                </Box>
                <Box m={'10px'}>
                    <Autocomplete size='small' style={{ width: 300 }}
                        options={inputCountryId ? countries[inputCountryId].timezones : []}
                        getOptionLabel={(option) => option.timezone}
                        onChange={handleChangeTimezone}
                        inputValue={inputTimezone}
                        renderInput={(params) => <TextField {...params} label='Timezone' variant='outlined' />}
                    />
                </Box>
                <Box m={'10px'}>
                    <Fab size='small' color='primary'
                        aria-label='add'
                        onClick={handleAddTimezone}
                        disabled={!inputCountryName || !inputTimezone}
                    >
                        <AddIcon />
                    </Fab>
                </Box>
            </Box>
            <Box style={{ height: 600, width: '100%' }}>
                <DataGrid
                    columns={[
                        { field: 'code', sortIndex: 0 },
                        { field: 'country', sortIndex: 1, width: 300 },
                        { field: 'timezone', sortIndex: 2, width: 300 },
                        { field: 'date', sortIndex: 3, width: 150 },
                        { field: 'time', sortIndex: 4, width: 150 },
                    ]}
                    rows={updatedTimezones}
                />
            </Box>
        </Fragment>
    )
}

export default TimezoneViewer