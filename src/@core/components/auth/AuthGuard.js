// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { auth } from '../../../../Firebase/firebase'


const AuthGuard = props => {
  const { children, fallback } = props
  const user = auth.currentUser;
  const router = useRouter()
  useEffect(
    () => {
      if (!user) {
        return
      }

      // && !window.localStorage.getItem('userData')

      if (user === null) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route]
  )
  if (auth.loading || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
