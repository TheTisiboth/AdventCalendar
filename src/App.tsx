import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { useQuery } from '@tanstack/react-query'
import { NETLIFY_FUNcTIONS_PATH } from './constants'

function App() {
  const [count, setCount] = useState(0)

  const fetchRbnb = async () => {
    const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_rbnb")
    return response.json()
  }

  const fetchPictures = async () => {
    const response = await fetch(NETLIFY_FUNcTIONS_PATH + "get_pictures")
    return response.json()
  }

  const { data, isLoading, isError } = useQuery({ queryKey: ["rbnb"], queryFn: fetchRbnb })
  const { data: pictures, isLoading: isPictureLoading } = useQuery<string[]>({ queryKey: ["pic"], queryFn: fetchPictures })

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Test</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {isPictureLoading && <p>Loading pic...</p>}
      {!isPictureLoading && pictures && pictures.length && pictures.map((pic, index) => <img key={index} src={pic} width={"10%"} />)}

      {isLoading && <p>Loading rbnb...</p>}
      {!isLoading && data && data.map((rbnb: any) => <p key={rbnb.name}>{rbnb.name}</p>)}

    </div>
  )
}

export default App
