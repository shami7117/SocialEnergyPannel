import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAuth } from 'firebase/auth'
import Spinner from 'src/@core/components/spinner'

const Home = () => {
  const auth = getAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.currentUser && router.route === '/') {
      router.replace('/dashboards/analytics')
    }
  }, [auth.currentUser, router])

  return <Spinner sx={{ height: '100%' }} />
}

export default Home
