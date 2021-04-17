/* eslint-disable react/no-children-prop */
import React from 'react'
import axios from 'axios'
import { Input, Image, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { CgProfile } from 'react-icons/cg'




function ImageUploadField({ value, name, onChange }) {

  const uploadUrl = process.env.REACT_APP_CLOUDINARY_URL
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_PRESET

  const handleUpload = async event => {
    const data = new FormData()
    data.append('file', event.target.files[0])
    data.append('upload_preset', uploadPreset)
    const res = await axios.post(uploadUrl, data)
    onChange({ target: { name, value: res.data.url } })
  }
  return (
    <>
      {value ?
        <Image
          boxSize='150px'
          objectFit='cover'
          src={value}
          alt='profile image'

        />
        :
        <InputGroup>
          <InputLeftElement children={<CgProfile />} />
          <Input
            pt={1}
            color='gray.700'
            className='input'
            type='file'
            onChange={handleUpload}
          />
        </InputGroup>
      }
    </>
  )
}
export default ImageUploadField