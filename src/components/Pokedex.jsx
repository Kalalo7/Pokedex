import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const PokedexContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  input {
    padding: 10px;
    border-radius: 20px;
    border: 2px solid #e0e0e0;
    width: 300px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #3f51b5;
    }
  }
  button {
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #3f51b5;
    color: white;
    cursor: pointer;
    &:hover {
      background: #303f9f;
    }
  }
`;

const PokemonCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const TypeBadge = styled.span`
  padding: 5px 15px;
  border-radius: 15px;
  margin: 0 5px;
  color: white;
  font-weight: bold;
  text-transform: capitalize;
  background-color: ${props => getTypeColor(props.type)};
`;

const StatBar = styled.div`
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 5px 0;
  .stat-fill {
    height: 100%;
    background: #3f51b5;
    width: ${props => (props.value / 255) * 100}%;
    transition: width 0.3s ease;
  }
`;

// Add this function to get colors for different Pokemon types
function getTypeColor(type) {
  const colors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  return colors[type] || '#777';
}

const Pokedex = () => {
  const [pokemon, setPokemon] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const searchPokemon = async () => {
    try {
      setError('');
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`);
      const speciesResponse = await axios.get(response.data.species.url);
      const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url);
      
      const getEvolutionDetails = (chain) => {
        const evolutions = [];
        let current = chain;
        
        while (current) {
          evolutions.push({
            name: current.species.name,
            min_level: current.evolution_details[0]?.min_level || null
          });
          current = current.evolves_to[0];
        }
        return evolutions;
      };

      const pokemon = {
        id: response.data.id,
        name: response.data.name,
        types: response.data.types.map(type => type.type.name),
        stats: response.data.stats.map(stat => ({
          name: stat.stat.name,
          value: stat.base_stat
        })),
        moves: response.data.moves.map(move => ({
          name: move.move.name,
          level: move.version_group_details[0]?.level_learned_at || 1
        })).sort((a, b) => a.level - b.level),
        image: response.data.sprites.other['official-artwork'].front_default,
        height: response.data.height / 10,
        weight: response.data.weight / 10,
        evolutions: getEvolutionDetails(evolutionResponse.data.chain)
      };
      setPokemon(pokemon);
    } catch (err) {
      setError('Pokemon not found');
      setPokemon(null);
    }
  };

  return (
    <PokedexContainer>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Pokédex</h1>
      <SearchBar>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter Pokemon name or number"
        />
        <button onClick={searchPokemon}>Search</button>
      </SearchBar>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {pokemon && (
        <PokemonCard>
          <div style={{ textAlign: 'center' }}>
            <img src={pokemon.image} alt={pokemon.name} style={{ width: '300px' }} />
            <h2 style={{ color: '#333' }}>
              #{pokemon.id.toString().padStart(3, '0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h2>
          </div>
          
          <h3>Types:</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type}>{type}</TypeBadge>
            ))}
          </div>

          <h3>Stats:</h3>
          {pokemon.stats.map(stat => (
            <div key={stat.name} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'capitalize' }}>{stat.name}</span>
                <span>{stat.value}</span>
              </div>
              <StatBar value={stat.value}>
                <div className="stat-fill" />
              </StatBar>
            </div>
          ))}

          <h3>Evolution Chain:</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
            {pokemon.evolutions.map((evo, index) => (
              <React.Fragment key={evo.name}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ textTransform: 'capitalize' }}>{evo.name}</div>
                  {evo.min_level && <div>Level {evo.min_level}</div>}
                </div>
                {index < pokemon.evolutions.length - 1 && (
                  <div>→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          <h3>Moves:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {pokemon.moves.slice(0, 8).map(move => (
              <div key={move.name} style={{
                background: '#f0f0f0',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '14px'
              }}>
                {move.name} (Lv.{move.level})
              </div>
            ))}
          </div>
        </PokemonCard>
      )}
    </PokedexContainer>
  );
};

export default Pokedex;