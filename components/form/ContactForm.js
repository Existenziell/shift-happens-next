import { useState } from 'react'
import Router from 'next/router'
import axios from "axios"
import TextInput from '../form/TextInput'
import TextArea from '../form/TextArea'
import Spinner from "../Spinner"
import EmailInput from './EmailInput'

export default function ContactForm() {

  const [formData, setFormData] = useState([])
  const [formButtonDisabled, setFormButtonDisabled] = useState(false)
  const [error, setError] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    const form = document.forms[0]
    if (form.checkValidity()) {
      e.preventDefault()
      setFormButtonDisabled(true)
      document.getElementById("submitBtn").classList.add("disabled")

      const data = JSON.stringify(formData)
      try {
        const res = await axios({
          method: "post",
          url: "/api/contact",
          headers: {
            "Content-Type": "application/json"
          },
          data
        })
        Router.push('/success')
      } catch (error) {
        setError("We are sorry, an error occurred.", error)
      }
    }
  }

  return (
    <div className="w-full md:w-4/5 lg:w-1/2 mt-8">
      <form className="flex flex-col items-center w-full text-center" onSubmit={handleSubmit}>

        <h1>Contact us</h1>

        <TextInput
          value={formData.name}
          name={"name"}
          label={"Name"}
          placeholder={"John Smith"}
          onChange={onChange}
          required={true}
        />

        <EmailInput
          value={formData.email}
          name={"email"}
          label={"Your Email Address"}
          placeholder={"your@email.com"}
          onChange={onChange}
          required={true}
        />

        <TextArea
          label={"How can we help?"}
          value={formData.message}
          name={"message"}
          placeholder="Your Message"
          onChange={onChange}
          required={true}
        />

        {error &&
          <div className="my-4 text-red-400">
            {error}
          </div>
        }

        <button
          className="button primary relative flex items-center justify-center"
          type="submit"
          disabled={formButtonDisabled}
          id="submitBtn"
        >
          <span>Send</span>
          {formButtonDisabled &&
            <Spinner type="dualring" className="w-1" />
          }
        </button>
      </form>
    </div>
  )
}
