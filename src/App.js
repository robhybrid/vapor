import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  
  const [media, setMedia] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3001/api/media')
      .then((res) => res.json())
      .then(media => {
        setMedia(media);
      })
      .catch(err => console.error('filed to fetch media', err));
    }, []);

    console.log('media', media);
  return (
    <div className="App">
      {media.map(filePath => <div className="media-object">{
        filePath.match(/\.gif$/i) ?
          <img className="gif" src={filePath} alt="" key={filePath}/> :
          null
      }</div>)}
    </div>
  );
}


export default App;
