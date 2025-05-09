import { useState, useEffect } from 'react'
import { projectAuth, projectFirebase} from '../firebase/config.js'
import { useAuthContext } from './useAuthContext'

export const useLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setError(null)
    setIsPending(true)
  
    try {
     
      const res = await projectAuth.signInWithEmailAndPassword(email, password)

   
      
      //set online status
      await projectFirebase.collection('users').doc(res.user.uid).update({online: true})


      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user })

      if (!isCancelled) {
        setIsPending(false)
        setError(null)
      }
    }catch(err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password"){
        setError("Invalid email or password")
      }
      else{
        setError("Incorrect email or password. Please try again.");
      }
      setIsPending(false)


      // if (!isCancelled) {
      //   setError(err.message)
      //   setIsPending(false)
      //   console.log(err.message)

      // }
      
    }
  }

  // useEffect(() => {
  //   return () => setIsCancelled(true)
  // }, [])

  return { login, isPending, error }
}