import '../styles/globals.css';
import Notification from '../components/Notification';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Notification />
      <Component {...pageProps} />
    </>
  );
}
