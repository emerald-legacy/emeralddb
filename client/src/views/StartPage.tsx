import React from 'react'
import styles from './StartPage.module.css'
import { useNavigate } from 'react-router'

const StartPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.startPage}>
      <header className={styles.header}>
        <h1>Welcome to EmeraldDB</h1>
        <p>
          Your comprehensive resource for the Emerald Legacy LCG and the Legend of the Five Rings
          LCG
        </p>
      </header>
      <main className={styles.mainContent}>
        <section className={styles.features}>
          <div
            className={styles.feature}
            onClick={() => navigate('/cards')}
            style={{ cursor: 'pointer' }}
          >
            <h2>Cards</h2>
            <p>Explore the full card database, including all cycles and packs.</p>
          </div>
          <div
            className={styles.feature}
            onClick={() => navigate('/decks')}
            style={{ cursor: 'pointer' }}
          >
            <h2>Decks</h2>
            <p>View and share public decklists.</p>
          </div>
          <div
            className={styles.feature}
            onClick={() => navigate('/builder')}
            style={{ cursor: 'pointer' }}
          >
            <h2>Builder</h2>
            <p>Build your own decks with our powerful deckbuilder tool.</p>
          </div>
          <div
            className={styles.feature}
            onClick={() => navigate('/rules')}
            style={{ cursor: 'pointer' }}
          >
            <h2>Rules</h2>
            <p>Access the complete rules reference and search for specific rulings.</p>
          </div>
        </section>
        <div className={styles.releaseNotesContainer}>
          <section className={styles.releaseNotes}>
            <h2>What's new?</h2>
            <ul>
              <li>
                You can now search for artists. You don't need to know all the special characters
                (Jeremie Moran will find Jérémie Morán)
              </li>
              <li>
                You can now filter cards for <b>Triggered Abilities</b> and <i>Keywords</i>
              </li>
              <li>Deck list overview shows stronghold and role of each deck</li>
              <li>Completely new deck statistics available! Check them out!</li>
            </ul>
            <p>
              If you want to know more or want to report a bug or an idea, visit{' '}
              <a href="https://github.com/emerald-legacy/emeralddb">
                https://github.com/emerald-legacy/emeralddb
              </a>
            </p>
          </section>
          <section className={styles.releaseNotes}>
            <a href="https://emeraldlegacy.org">
              <img src="/static/emerald-legacy-logo.webp" alt="Emerald Legacy Logo" width="300" />
            </a>
            <p>
              Visit <a href="https://emeraldlegacy.org">https://emeraldlegacy.org</a> for the latest
              news, stories, and cards.
            </p>
            <p>
              Emerald Legacy is a fan-driven project, which develops the Emerald Legacy LCG, a
              continuation of the Legend of the Five Rings LCG by FFG.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default StartPage
