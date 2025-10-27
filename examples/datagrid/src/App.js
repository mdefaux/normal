import './App.css';
import React from 'react';

class App extends React.Component {
  state = {
    message: [],
    header: {}
  };

  componentDidMount() {
    console.log("didmount")
    fetch('http://localhost:3001/orm/Customer/all')
      .then(response => response)
      .then(resp => resp.json())
      .then(res => {

        console.log(res)

        this.setState({ message: res }, () => { console.log(this.state.message) })

      })

      .catch(e => {

        console.error(e);

      });

    console.log("didmount")
    fetch('http://localhost:3001/model/Customer')
      .then(response => response)
      .then(resp => resp.json())
      .then(res => {

        console.log(res)

        this.setState({ header: res }, () => { console.log(this.state.header) })

      })

      .catch(e => {

        console.error(e);

      });
  }

  onHeaderClick(columnName) {
    let segno = 1
    if (this.state.columnName === columnName) {
      segno = -this.state.invertiSegno
    }
    this.setState({
      columnName: columnName,
      invertiSegno: segno,
      message: this.state.message.sort((a, b) => {
        if (this.state.header[columnName].type === "string") {
          return (b[columnName] > a[columnName] ? -1 : 1) * segno
        }
        return (b[columnName] - a[columnName]) * segno
      })
    })

  }

  render() {
    return (
      <table id="table1" className='tabella'>
        <tbody>

          <tr>
            {
              Object.keys(this.state.header).map(k => {
                if (this.state.header[k].type === "number" || this.state.header[k].type === "integer") {
                  return <th className='header' onClick={() => { this.onHeaderClick(k) }}>{k}()</th>
                }
                return <th className='header' onClick={() => { this.onHeaderClick(k) }}>{k}()</th>
              })
            }
          </tr>

          {
            this.state.message.map((riga, index) => {
              console.log(index)
              return <tr key={riga.id}>
                {
                  Object.keys(riga).map(k => (
                    <td>{riga[k]}</td>
                  ))
                }
              </tr>
            })
          }
        </tbody>
      </table>
    );
  }
}

export default App;
