import React, { useState } from 'react';

export default function Form() {

  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [created, setCreate] = useState(undefined);
  const [error, setError] = useState(undefined);

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch('/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({
        slug: slug || undefined,
        url: url
      })
    });
    
    if (response.ok) {
      const newUrl = await response.json();
      console.log(newUrl);
      setCreate(newUrl);
    }
    else {
      const error = await response.json();
      console.log(error);
      setError(error);
    }
  };

  function handleChange(event) {
    const name = event.target.name;

    if (name === 'url') {
      setUrl(event.target.value);
    }
    else if (name === 'slug') {
      setSlug(event.target.value);
    }
  }

  return (
    <div className="container">
      <h1>Danurls</h1>
      <form>
        <div className="mb-3">
          <label htmlFor="url" className="form-label">URL</label>
          <input type="text" name="url" id="url" value={url} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label htmlFor="slug" className="form-label">Slug</label>
          <input type="text" name="slug" id="slug" value={slug} onChange={handleChange} className="form-control"/>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary">Create</button>
      </form>
      {created ? 
        <div className='mt-3'>
          <h3>New url:</h3>
          <a href={`http://localhost:3000/${created.slug}`}>localhost:3000/{created.slug}</a>
        </div>
        :
        <div></div>
      }
      {error ? 
        <div>{error.message}</div>
      :
        <div></div>
      }
    </div>
  );
}
