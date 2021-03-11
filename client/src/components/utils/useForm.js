import React from 'react'


export default function useForm(initialState) {
  const [formdata, setFormdata] = React.useState(initialState)
  const [errors, setErrors] = React.useState(initialState)

  const handleChange = event => {

    const value = event.target.value
    const nextState = { ...formdata, [event.target.name]: value }
    setFormdata(nextState)
    setErrors({ ...errors, [event.target.name]: '' })
  }

  return {
    formdata,
    errors,
    handleChange,
    setErrors,
    setFormdata
  }
}
