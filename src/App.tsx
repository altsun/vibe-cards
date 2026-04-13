import { GameBoard } from './components/GameBoard'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Vibe Cards</h1>
        <p>Strategic Card Battle Game</p>
      </header>
      <main>
        <GameBoard />
      </main>
    </div>
  )
}

export default App
