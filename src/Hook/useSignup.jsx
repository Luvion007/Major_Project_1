import { useState, useEffect } from 'react'
import { projectAuth, projectStorage, projectFirebase} from '../firebase/config.js'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (email, password, displayName, thumbnail) => {
    setError(null)
    setIsPending(true)
  
    try {
      // signup
      const res = await projectAuth.createUserWithEmailAndPassword(email, password)

      if (!res) {
        throw new Error('Could not complete signup')
      }

      //upload user thumbnail
      let imgUrl = null;
      if (thumbnail) {
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`
        const img = await projectStorage.ref(uploadPath).put(thumbnail)
        imgUrl = await img.ref.getDownloadURL()
      }

      // add display name to user
      await res.user.updateProfile({ displayName, photoURL: imgUrl})

      //Create a user document
      await projectFirebase.collection('users').doc(res.user.uid).set({
        online: true,
        displayName,
        photoURL: imgUrl,
        roles : 'user',
        occupations: ''
      })

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user })

      // if (!isCancelled) {
        setIsPending(false)
        setError(null)
      // }
    } 
    catch(err) {
      // if (!isCancelled) {
        setError(err.message)
        setIsPending(false)
      // }
    }
  }

 

  useEffect(() => {
    return () => setIsCancelled(true)
  }, [])

  return { signup, error, isPending }
}


