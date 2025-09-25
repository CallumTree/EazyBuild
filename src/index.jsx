
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ViabilityProvider } from './store/viability'
import './index.css'
import 'leaflet/dist/leaflet.css'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<ViabilityProvider>
			<App />
		</ViabilityProvider>
	</React.StrictMode>
)
