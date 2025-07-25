import React from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {

    const [city, setCity] = useState("");
    function handleChange(e) {
        setCity(e.target.value);
    }

    const [name, setName] = useState("");
    const [temp, setTemp] = useState("");
    const [wind, setWind] = useState("");
    const [pressure, setPressure] = useState("");
    const [humidity, setHumidity] = useState("");
    const [sunrise, setSunrise] = useState("");
    const [sunset, setSunset] = useState("");

    const [check,setCheck] = useState(false);

    console.log(process.env.REACT_APP_API_KEY);
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_API_KEY}&units=metric`

    function convertToLocalTime(unixTimestamp) {
        // Create a Date object from the Unix timestamp (in milliseconds)
        const date = new Date(unixTimestamp * 1000);
    
        // Convert to local time string
        const localTimeString = date.toLocaleTimeString();
    
        return localTimeString;
    }

    async function apply() {
        const toastId = toast.loading('Searching...');
        try {
            const resp = await fetch(api);
            const data = await resp.json();
            const { main, name, wind ,sys} = data;
            const temp = main.temp;
            const pressure = (main.pressure)*100;
            const humidity = main.humidity;
            const speed = ((wind.speed) * (18 / 5)).toFixed(3);
            const sunrise = convertToLocalTime(sys.sunrise);
            const sunset =convertToLocalTime(sys.sunset);
            // console.log(sunrise);
            // console.log(sunset);

            setName(name);
            setTemp(temp);
            setWind(speed);
            setPressure(pressure);
            setHumidity(humidity);
            setSunrise(sunrise);
            setSunset(sunset);

            toast.dismiss(toastId);
            setCheck(true);
        } catch (err) {
            console.log(err);
            toast.dismiss(toastId);
            toast.error("Location Not Found");
            setCheck(false);
        }
    }
    return (
        <>
            <div className=' head flex justify-center align-middle mt-20'>
                <div className='main flex flex-col items-center bg-yellow-400 h-auto p-8 w-96 rounded-3xl shadow-2xl shadow-rose-950'>
                    <h1 className=' text-4xl font-bold'>Weather App</h1>
                    <div className='find'>
                        <input value={city} onChange={handleChange} type="text" placeholder='Enter Your City' className=' w-56 mt-4 h-10 border-teal-800 border-2 rounded-l-xl pl-2 font-semibold' />
                        <button onClick={apply} className=' bg-red-500 font-bold w-20 h-10 rounded-r-xl'>Search</button>
                    </div>
                    {check ?
                        (<div className=' mt-10 flex flex-col'>
                            <h2 className='output font-medium text-2xl'><strong>Location:- </strong>{name}</h2>
                            <h2 className='output font-medium text-2xl'><strong>Tempreture:- </strong>{temp}&deg;C</h2>
                            <h2 className='output font-medium text-2xl'><strong>Humidity:- </strong>{humidity}%</h2>
                            <h2 className='output font-medium text-2xl'><strong>Wind Speed:- </strong>{wind} Km/hr</h2>
                            <h2 className='output font-medium text-2xl'><strong>Pressure:- </strong>{pressure} pascal</h2>
                            <h2 className='output font-medium text-2xl'><strong>Sunrise:- </strong>{sunrise}</h2>
                            <h2 className='output font-medium text-2xl'><strong>Sunset:- </strong>{sunset}</h2>
                        </div>) : 
                        ""}
                </div>
            </div>
        </>
    )
}
