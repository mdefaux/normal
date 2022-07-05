import logo from './logo.svg';
import './App.css';

function App() {
  fetch('http://localhost:3000/datagrid')
  .then(response=>response)
  .then(resp=>resp.json())
  .then(res => {

    console.log(res)
  })

  .catch(e => {

    console.error(e);

  });
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
