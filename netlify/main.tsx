import {createRoot} from 'react-dom/client';
import App from '../src/App';
import GoatCounterBridge from '../src/analytics/GoatCounterBridge';
import '../src/styles.css';
import '../src/warm-theme.css';

const container=document.getElementById('root');
if(!container)throw new Error('Missing learning application container');
createRoot(container).render(<><App/><GoatCounterBridge/></>);
