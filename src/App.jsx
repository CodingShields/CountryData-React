import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

function App() {
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(countries[0]?.name?.common || "");
	const [selectedCountries, setSelectedCountries] = useState([]);
	const [state, setState] = useState({
		loading: false,
		error: false,
		errorMessage: "",
		resetBtn: false,
	});

	const initialState = () => {
		setCountries([]);
		setSelectedCountries([]);
		setSelectedCountries([]);
		setState({
			loading: false,
			error: false,
			errorMessage: "",
			resetBtn: false,
		});
	};

	useEffect(() => {
		initialState();
		setState({ ...state, loading: true });
		const fetchCountries = async () => {
			const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca3");
			const data = await response.json();
			if (!response.ok) {
				throw new Error("");
			} else {
				const randomCountries = data.sort(() => Math.random() - Math.random()).slice(0, 4);
				setCountries(
					randomCountries.map((item) => ({
						id: nanoid(),
						name: item.name.common,
						flag: item.flags.png,
						countryCode: item.cca3,
					}))
				);
			}
		};
		fetchCountries();
		setState({ ...state, loading: false });
	}, [state.reset]);

	const handleCountrySelect = (e) => {
		const selectedCountry = e.target.value;
		const countryCode = countries.filter((item) => item.name === selectedCountry).map((item) => item.countryCode);
		const selectedCountryFlag = countries.filter((item) => item.name === selectedCountry).map((item) => item.flag);
		const countryName = countries.filter((item) => item.name === selectedCountry).map((item) => item.name);
		const countrySelected = selectedCountries.map((item) => item.name).includes(countryName[0]);

		const fetchGdp = async () => {
			const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				setState({ error: true, errorMessage: "Error: Country GDP not found" });
				setTimeout(() => {
					setState({ error: false, errorMessage: "" });
				}, 3000);
			} else {
				try {
					const data = await response.json();
					console.log(data, "data");
					const gdpData = data[1][0]["value"];
					const formatCurrency = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(gdpData);
					if (countrySelected === true) {
						setState({ error: true, errorMessage: "Error: Country already selected" });
						setTimeout(() => {
							setState({ error: false, errorMessage: "" });
						}, 3000);
					} else if (gdpData === null) {
						setState({ error: true, errorMessage: "Error: Country GDP not found" });
						setSelectedCountries((prevSelectedCountries) => [
							...prevSelectedCountries,
							{
								name: selectedCountry,
								flag: selectedCountryFlag,
								gdp: "GDP Data Not Found",
								selected: true,
							},
						]);
						setTimeout(() => {
							setState({ error: false, errorMessage: "" });
						}, 3000);
					} else {
						setSelectedCountries((prevSelectedCountries) => [
							...prevSelectedCountries,
							{
								name: selectedCountry,
								flag: selectedCountryFlag,
								gdp: formatCurrency,
								selected: true,
							},
						]);
					}
				} catch (error) {
					setState({ error: true, errorMessage: "Error: Country GDP not found" });
					setSelectedCountries((prevSelectedCountries) => [
						...prevSelectedCountries,
						{
							name: selectedCountry,
							flag: selectedCountryFlag,
							gdp: "GDP Data Not Found",
							selected: true,
						},
					]);

					setTimeout(() => {
						setState({ error: false, errorMessage: "" });
					}, 3000);
				}
			}
		};
		fetchGdp();
		setState({ ...state, renderSelection: true });
	};

	const handleReset = () => {
		initialState();
	};

	return (
		<div className='country-container-main'>
			<h1> Country Data Interview Test</h1>
			<div className='country-container'>
				<select onChange={handleCountrySelect} value={selectedCountry} className='country-list'>
					<option value=''>Please select one</option>
					{state.loading ? <p>Loading...</p> : ""}
					{countries.map((country) => {
						return (
							<option key={country.id} value={country.name} className='country-option'>
								{country.name}
							</option>
						);
					})}
				</select>
				{state.error ? (
					<div className='error-container'>
						<div className='error-content'>
							<p className='error-message'>{state.errorMessage}</p>
						</div>
					</div>
				) : (
					""
				)}
				{selectedCountries.map((country) => {
					return (
						<div key={country.id} className='selected-country-container-list'>
							<div className='country-info-container'>
								<>
									<img className='country-flag-img' src={country.flag} />
									<h4 className='country-name'>{country.name}</h4>
								</>
								<>
									<h4 className='country-text'>{country.gdp}</h4>
								</>
							</div>
						</div>
					);
				})}
			</div>
			{selectedCountries.length === 4 ? (
				<button className='reset-btn' onClick={handleReset}>
					Reset Countries
				</button>
			) : (
				""
			)}
		</div>
	);
}

export default App;
