import './App.css';
import React from 'react'; 

class App extends React.Component {
  state = {
    message: []   
  };

  componentDidMount() {
    console.log("didmount")
    fetch('http://localhost:3000/datagrid')
    .then(response=>response)
    .then(resp=>resp.json())
    .then(res => {

    console.log(res)
    this.setState({message:res},()=>{console.log(this.state.message)})
})

  .catch(e => {

    console.error(e);

  });
  }

  render() {
  return (
      <table className='tabella'>
        <tr>
          <th>Id</th>
          <th>Nome</th>
          <th>Cognome</th>
        </tr>
        {
          this.state.message.map((riga)=>(
            <tr>
              <td>{riga.id}</td>
              <td>{riga.nome}</td>
              <td>{riga.cognome}</td>
            </tr>
          ))
        }
        
      </table>
  );
  }
}

export default App;
