import 'bootstrap/dist/css/bootstrap.css'
import { buildClient } from '../api/buildClient'
import Header          from '../components/Header'

const App = ({
	Component,
	pageProps,
	currentUser,
}) => {
	return (
		<>
			<Header currentUser={ currentUser } />
			<div className="container">
				<Component { ...pageProps } currentUser={ currentUser } />
			</div>
		</>
	)
}

App.getInitialProps = async (appContext) => {

	const client = buildClient(appContext.ctx)
	const { data } = await client.get('/api/users/currentuser')

	let pageProps = {}
	if (appContext.Component.getInitialProps) {
		pageProps = await appContext.Component.getInitialProps(appContext.ctx,
			client, data.currentUser)
	}

	return { pageProps, ...data }
}

export default App
