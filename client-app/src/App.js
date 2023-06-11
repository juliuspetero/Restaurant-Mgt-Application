import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {

  const [restaurants, setRestaurants] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [updateState, setUpdateState] = useState(-1);
  const [image, setImage] = useState();

  useEffect(() => {
    setLoading(false);
    fetch('/restaurant')
      .then(response => response.json())
      .then(json => setRestaurants(json))
      .finally(() => setLoading(false))
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <p> Restaurant Management Application</p>
      </header>
      <AddRestaurant setRestaurants={setRestaurants} />
      <div>
        {loading ?
          (<div>Loading Restaurants...</div>) : (
            <div>
              <form onSubmit={handleRestaurantUpdate}>
                <table className='restaurant-table'>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Cuisine Type</th>
                      <th>Location</th>
                      <th>Creation Date</th>
                      <th>Photo</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant, i) => (
                      updateState === restaurant._id ? <Edit restaurant={restaurant} restaurants={restaurants} setRestaurants={setRestaurants} uniqueId={i} /> :
                        (<tr key={i}>
                          <td>{restaurant._id}</td>
                          <td>{restaurant.name}</td>
                          <td>{restaurant.cuisineType}</td>
                          <td>{restaurant.location}</td>
                          <td>{restaurant.created_at}</td>
                          <td><img src={restaurant.image} alt={restaurant.name} /></td>
                          <td>
                            <button className='edit' type='button' onClick={() => editRestaurant(restaurant._id)}>Edit</button>
                            <button className='delete' type='button' onClick={() => deleteRestaurant(restaurant._id)}>Delete</button>
                          </td>
                        </tr>)
                    ))}
                  </tbody>
                </table>
              </form>
            </div>
          )}
      </div>
    </div>
  );

  async function handleRestaurantUpdate(event) {
    event.preventDefault();
    const id = event.target.elements.id.value;
    const name = event.target.elements.name.value;
    const cuisineType = event.target.elements.cuisineType.value;
    const location = event.target.elements.location.value;
    const updatedRestaurant = {
      name,
      cuisineType,
      location
    }
    const formData = new FormData();
    if (image) {
      formData.append("imageFile", image);
    }
    formData.append('jsonString', JSON.stringify(updatedRestaurant));
    const response = await fetch(`/restaurant/${id}`, {
      method: 'PUT',
      body: formData
    });
    const result = await response.json();
    const updatedRestaurants = restaurants.map(res => res._id === result._id ? result : res);
    setRestaurants(updatedRestaurants);
    setUpdateState(-1);
    setImage(null)
  }

  async function deleteRestaurant(id) {
    const response = await fetch(`/restaurant/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    await response.json();
    const newList = restaurants.filter(r => r._id !== id);
    setRestaurants(newList);
  }

  function editRestaurant(id) {
    setUpdateState(id);
  }

  function Edit({ restaurant, restaurants, setRestaurants, uniqueId }) {
    const [updatedRestaurant, setUpdatedRestaurant] = useState(restaurant);
    return (
      <tr key={uniqueId}>
        <td><input type='text' name='id' disabled value={updatedRestaurant._id}></input></td>
        <td><input type='text' name='name' value={updatedRestaurant.name} onChange={e => setUpdatedRestaurant({ ...updatedRestaurant, name: e.target.value })} ></input></td>
        <td><input type='text' name='cuisineType' value={updatedRestaurant.cuisineType} onChange={e => setUpdatedRestaurant({ ...updatedRestaurant, cuisineType: e.target.value })} ></input></td>
        <td><input type='text' name='location' value={updatedRestaurant.location} onChange={e => setUpdatedRestaurant({ ...updatedRestaurant, location: e.target.value })} ></input></td>
        <td>{restaurant.created_at}</td>
        <td><input type='file' name='image' onChange={e => e.target.files ? setImage(e.target.files[0]) : null}></input></td>
        <td><button type='submit' className='edit'>Submit</button></td>
      </tr>)
  }

  function AddRestaurant({ setRestaurants }) {
    const [newRestaurant, setNewRestaurant] = useState({});
    const nameRef = useRef();
    const cuisineTypeRef = useRef();
    const locationRef = useRef();
    const imageRef = useRef();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append('jsonString', JSON.stringify(newRestaurant));
    const handleSubmit = async (event) => {
      event.preventDefault();
      const response = await fetch('/restaurant', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      setRestaurants((prevList) => {
        return prevList.concat(result)
      })
      nameRef.current.value = '';
      cuisineTypeRef.current.value = '';
      locationRef.current.value = '';
      imageRef.current.value = '';
      setImage(null);
    }
    return (
      <form className='addRestaurant' onSubmit={handleSubmit}>
        <input type='text' name='name' placeholder='Enter Name' ref={nameRef} onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })}></input>
        <input type='text' name='cuisineType' placeholder='Enter Cuisine Type' ref={cuisineTypeRef} onChange={e => setNewRestaurant({ ...newRestaurant, cuisineType: e.target.value })}></input>
        <input type='text' name='location' placeholder='Enter Location' ref={locationRef} onChange={e => setNewRestaurant({ ...newRestaurant, location: e.target.value })}></input>
        <input type='file' name='image' ref={imageRef} onChange={e => e.target.files ? setImage(e.target.files[0]) : null}></input>
        <button type='submit'>Add</button>
      </form>
    )
  }
}

export default App;