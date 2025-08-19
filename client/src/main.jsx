import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorLogin from './pages/DoctorLogin'
import DoctorRegister from './pages/DoctorRegister'
import Book from './pages/Book'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/login', element: <Login/> },
  { path: '/register', element: <Register/> },
  { path: '/doctor/login', element: <DoctorLogin/> },
  { path: '/doctor/register', element: <DoctorRegister/> },
  { path: '/book/:doctorId', element: <Book/> },
  { path: '/dashboard/patient', element: <PatientDashboard/> },
  { path: '/dashboard/doctor', element: <DoctorDashboard/> }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>
)
