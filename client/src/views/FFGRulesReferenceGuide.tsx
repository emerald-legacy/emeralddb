import {
  Grid,
  Typography,
  useMediaQuery,
  Box,
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState, type JSX } from 'react'
import TocIcon from '@mui/icons-material/Toc'

const PREFIX = 'FFGRulesReferenceGuide'

const classes = {
  li: `${PREFIX}-li`,
  level1: `${PREFIX}-level1`,
  level2: `${PREFIX}-level2`,
  level3: `${PREFIX}-level3`,
  fab: `${PREFIX}-fab`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.li}`]: {
    listStyle: 'none',
  },

  [`& .${classes.level1}`]: {
    fontSize: '14px',
  },

  [`& .${classes.level2}`]: {
    fontSize: '12px',
    paddingLeft: '1em',
  },

  [`& .${classes.level3}`]: {
    fontSize: '10px',
    paddingLeft: '2em',
  },

  [`& .${classes.fab}`]: {
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5),
  },
}))

interface Heading {
  href: string
  text: string
  level: '1' | '2' | '3'
}

function AnchoredHeading(props: {
  level: '1' | '2' | '3'
  text: string
  addHeading: (text: string, href: string, level: '1' | '2' | '3') => void
}): JSX.Element {
  const shorttext =
    props.text.indexOf('(') > -1
      ? props.text.substring(0, props.text.indexOf('(')).trim()
      : props.text
  const headingId = shorttext
    .toLowerCase()
    .replace(/\W+/g, '-')
    .replace(/(^-|-$)/g, '')

  useEffect(() => {
    props.addHeading(props.text, `#${headingId}`, props.level)
  }, [props.text, props.level])

  const variant: 'h4' | 'h5' | 'h6' = props.level === '1' ? 'h4' : props.level === '2' ? 'h5' : 'h6'

  return (
    <Typography id={headingId} variant={variant}>
      {props.text}
    </Typography>
  )
}

export function FFGRulesReferenceGuide(): JSX.Element {
  const currentHost = window.location.host
  const currentProtocol = window.location.protocol
  const host = currentProtocol + '//' + currentHost
  const [headings, setHeadings] = useState<Heading[]>([])
  const isSmOrBigger = useMediaQuery('(min-width:600px)')
  const [showTable, setShowTable] = useState(false)

  const addHeading = (text: string, href: string, level: '1' | '2' | '3') => {
    if (headings.filter((heading) => heading.href === href).length === 0) {
      headings.push({
        text: text,
        href: href,
        level: level,
      })
      setHeadings([...headings])
    }
  }

  function TableOfContents(): JSX.Element {
    return (
      <ul>
        {headings.map((heading, index) => (
          <li
            key={index}
            className={`${classes.li} ${
              heading.level === '1'
                ? classes.level1
                : heading.level === '2'
                  ? classes.level2
                  : classes.level3
            }`}
          >
            <a
              href={heading.href}
              style={{ scrollBehavior: 'smooth' }}
              onClick={(e) => {
                e.preventDefault()
                setShowTable(false)
                document.querySelector(heading.href)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <Root>
      <Grid container spacing={3} direction={isSmOrBigger ? 'row' : 'column-reverse'}>
        <Grid size={{ sm: 8 }}>
          <Box style={{ maxHeight: isSmOrBigger ? '93vh' : '85vh', overflow: 'auto' }} p={1}>
            <Typography variant="h4">Fantasy Flight Games: Rules Reference</Typography>
            <p>
              <b>Version 16</b>, January 5, 2021
            </p>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="Rules Reference" />
              <p>
                This document is intended as the definitive source for rules information, but does
                not teach players how to play the game. Players should first read the Learn to Play
                book in its entirety and use this Rules Reference as needed while playing the game.
              </p>
              <p>
                The majority of this guide consists of the glossary, which provides an alphabetical
                listing of terms and situations a player might encounter during a game. This section
                should be the first destination for players who have a rules question.
              </p>
              <p>
                The latter part of this guide contains two appendices. The first appendix provides
                detailed timing diagrams that illustrate the structure of an entire game round, as
                well as how to handle each game step presented in those diagrams. The second
                provides a detailed anatomy of each card type.
              </p>
            </section>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="The Jade Rule" />
              <p>
                If the text of this Rules Reference directly contradicts the text of the Learn to
                Play book, the text of the Rules Reference takes precedence.
              </p>
              <p>
                If the text of a card directly contradicts the text of either the Rules Reference or
                the Learn to play book, the text of the card takes precedence.
              </p>
            </section>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="Multiple Formats" />
              <p>
                While the rules presented in the Learn to Play book introduce the game’s primary
                stronghold format, there are many other formats that allow Legend of the Five Rings
                to be played in different unique ways. Currently there are four fully supported
                formats for the game, each with its own additional rules supplements which can be
                found online at www.L5R.com.
              </p>
              <ul>
                <li>
                  The stronghold format is a two-player head-to-head format in which players attempt
                  to break each others’ strongholds.
                </li>
                <li>
                  The skirmish format is a two-player head-to-head format in which players attempt
                  to break all three of their opponent’s provinces. No stronghold or province cards
                  are used in this format.
                </li>
                <li>
                  The enlightenment format is a three-player head-to-head format in which players
                  attempt to collect all five rings to achieve enlightenment.
                </li>
                <li>
                  The team conquest format is a four-player head-to-head format in which two teams
                  attempt to destroy both of the opposing team’s strongholds.
                </li>
              </ul>
              <p>
                The rules in this Rules Reference document apply to all formats, unless explicitly
                stated otherwise.
              </p>
            </section>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="Glossary" />
              <p>
                The following is an alphabetical list of entries for game rules, terms, and
                situations that may occur during play.
              </p>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Ability" />
                <p>
                  An ability is the special game text that a card contributes to the game. Card
                  abilities fall into one of the following types: actions, constant abilities,
                  interrupts, keywords, and reactions. Some interrupt and reaction abilities are
                  also forced.
                </p>
                <ul>
                  <li>
                    Card abilities only interact with, and can only target, cards that are in play,
                    unless the ability specifically refers to an out-of-play area or element. Card
                    abilities on characters, attachments, holdings, strongholds, and provinces can
                    only be initiated or affect the game while they are in play unless the ability
                    specifically refers to being used from an out-of-play area, or require that the
                    card be out of play for the ability to resolve. Event cards and role cards
                    implicitly interact with the game from an out-of-play area, as established by
                    the rules of their cardtypes.
                  </li>
                  <li>
                    The application or initiation of the following types of abilities is mandatory:
                    constant abilities, forced interrupt abilities, and forced reaction abilities.
                  </li>
                  <li>
                    The initiation of any keyword which uses the word "may" in its keyword
                    description is optional. The application of all other keywords is mandatory.
                  </li>
                  <li>
                    The initiation of action, interrupt, and reaction abilities is optional. The
                    word "may" also incorporates a player option into the resolution of an ability.
                    The player who controls the card on which an optional ability exists determines
                    whether or not he or she wishes to use that ability at the appropriate time.
                  </li>
                  <li>
                    An ability prefaced by a bold-face timing trigger followed by a colon is
                    referred to as a "triggered ability."
                  </li>
                  <li>
                    The controller of the card from which an ability is resolving makes all
                    decisions required by that ability's resolution unless another player is
                    specifed by the ability's text.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#cost">Cost</a>, <a href="#effects">Effects</a>,{' '}
                  <a href="#forced">Forced</a>, <a href="#target">Target</a>,{' '}
                  <a href="#triggered-abilities">Triggered Abilities</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Action, Action Ability" />
                <p>
                  An action ability is a triggered card ability that contains the boldface "
                  <b>Action:</b>" precursor. An action ability may be triggered by its controller
                  during any action window (see{' '}
                  <a href="#appendix-i-timing-and-gameplay">"Appendix I: Timing and Gameplay"</a>).
                </p>
                <ul>
                  <li>
                    Unless otherwise noted by the ability, each action ability may be initiated only
                    once each round.
                  </li>
                  <li>
                    An action that has been initiated must be resolved before the next action can be
                    initiated.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#ability">Ability</a>,{' '}
                  <a href="#triggered-abilities">Triggered Abilities</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Active Player" />
                <p>
                  In some phases, the game creates an active player, who is granted permission to
                  perform a specified task.
                </p>
                <ul>
                  <li>
                    During the dynasty phase, the active player is the player who is permitted to
                    play character cards from his or her provinces or initiate an action ability.
                    The status of active player alternates between players in this phase until all
                    players have passed.
                  </li>
                  <li>
                    During the conflict phase, the active player is the player with the opportunity
                    to initiate a conflict, or the player who is resolving a conflict he or she has
                    initiated.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Additional Conflicts" />
                <p>
                  Some card abilities allow a player to declare an additional conflict during the
                  conflict phase. The additional conflict created by such an effect is in addition
                  to a player’s two normal conflict opportunities. It does not replace the normal{' '}
                  <span className="icon icon-conflict-military" /> or{' '}
                  <span className="icon icon-conflict-political" /> conflict opportunity that player
                  has each conflict phase.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Additional Cost" />
                <p>
                  Some card abilities require an additional cost to be played to play a card,
                  trigger an ability, or perform a framework step. If the additional cost cannot be
                  paid, the game action cannot be initiated.
                </p>
                <ul>
                  <li>All costs are paid simultaneously, including additional ones.</li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#cost">Cost</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Against" />
                <p>
                  During a conflict, the attacking player and the defending player are considered to
                  be taking part in the conflict against each other.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Ancestral" />
                <p>
                  Ancestral is a keyword ability that appears on attachments. If the card or game
                  element to which an ancestral attachment is attached leaves play, the ancestral
                  attachment is returned to its owner's hand instead of being discarded.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Attachment Cards" />
                <p>
                  Attachment cards represent weapons, armor, items, skills, spells, conditions, and
                  titles. An attachment card enters play ready and attached to another card or game
                  element, and remains in play unless it is removed by an ability, or unless the
                  attached card leaves play.
                </p>
                <ul>
                  <li>
                    An attachment cannot enter play if there is no eligible card or game element to
                    which it can attach.
                  </li>
                  <li>
                    An attachment can only attach to a character in play, unless otherwise specified
                    by the attachment's text.
                  </li>
                  <li>
                    There is no limit on the number of attachments that may be attached to a card or
                    game element.
                  </li>
                  <li>
                    If the card to which an attachment is attached leaves play, simultaneously
                    discard the attachment.
                  </li>
                  <li>
                    If a situation arises in which an attachment is not legally attached, discard
                    the attachment.
                  </li>
                  <li>
                    An attachment a player controls remains under his or her control even if the
                    card or game element to which it is attached is under an opponent's control.
                  </li>
                  <li>
                    An attachment card bows and readies independently of the card to which it is
                    attached.
                  </li>
                  <li>
                    If an attachment has skill modifiers, those modifiers apply to the skill of the
                    attached character. Such modifiers apply to the character even while the
                    attachment is bowed.
                  </li>
                  <li>Attachments on a province are not considered to be in that province.</li>
                  <li>
                    If a character card is in play as an attachment, the skill values on that
                    character-as-attachment are not treated as skill modifiers (as they lack the "+"
                    or "-" symbol before the value) for the character to which the card is attached.
                  </li>
                  <li>
                    If an attachment has a limit (for example “Limit 1<em>Battlefield</em>
                    attachment per province”), that indicates that only one instance of a particular
                    subset of cards can be attached to the same card or game element. If a second
                    card of that subset becomes attached to the card or game element, the
                    previously-attached card is discarded as the limit has been surpassed.
                  </li>
                </ul>
                <p>
                  For attachment card anatomy, see "
                  <a href="#appendix-ii-card-anatomy">Appendix II: Card Anatomy</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Attacker, Attacking Character, Attacking Player
            "
                />
                <p>
                  The term "attacking character" refers to a character that is participating in a
                  conflict on the side of the player who initiated the conflict. The term "attacker"
                  is also used as shorthand for "attacking character."
                </p>
                <p>
                  The term "attacking player" refers to the player that initiated the conflict that
                  is currently resolving.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Base Value" />
                <p>
                  The value of a quantity before other modifiers are applied. For most quantities,
                  it is also the printed value.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Bid Value" />
                <p>
                  If the value of an honor bid is modified, resolve that bid as if the modified
                  value is that player's bid. The value of a bid may exceed five (the highest number
                  on the honor dial), or may be reduced to zero.
                </p>
                <ul>
                  <li>
                    When the value of an honor bid is modified, the setting on the dial is not
                    itself adjusted.
                  </li>
                  <li>
                    If a card ability references a player’s honor bid, the ability is referencing
                    the current setting on the player’s honor dial.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Blank" />
                <p>
                  If an ability causes a card's printed text box to be considered "blank," that text
                  box is treated as if it did not have any of its printed <em>Traits</em> or card
                  abilities. Text gained from another source is not blanked.
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Breaking a Province, Broken Province"
                />
                <p>
                  If the attacking player wins a conflict with a total skill difference (between the
                  attacking player and the defending player) equal to or greater than the defense
                  strength of the attacked province, the province breaks.
                </p>
                <ul>
                  <li>
                    Rotate a province card 180 degrees or discard a province token to indicate the
                    province is broken.
                  </li>
                  <li>
                    When a province is broken, the attacking player has the option of discarding any
                    dynasty cards in that province. If this option is taken, the province is
                    refilled facedown.
                  </li>
                  <li>Ability text on a broken province card is not active.</li>
                  <li>
                    Dynasty cards may still be played from broken provinces, and broken provinces
                    still refill following the standard game rules.
                  </li>
                  <li>
                    If three of a player's non-stronghold provinces are broken, that player's
                    stronghold becomes an eligible province against which attacks may be made. If a
                    player's stronghold province is broken, that player loses the game.
                  </li>
                  <ul>
                    <li>
                      If a player does not have a stronghold province, they lose the game when all
                      of their provinces are broken.
                    </li>
                  </ul>
                  <li>
                    If a province breaks for any reason other than through standard conflict
                    resolution, the opponent of the player who controls that province is considered
                    to have broken the province.
                  </li>
                  <ul>
                    <li>
                      If a player has multiple opponents, each of those players is considered to
                      have broken the province.
                    </li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Bow, Bowed" />
                <p>
                  Cards often bow after participating in a conflict, to use card abilities, or as
                  the result of card or game effects. When a card is bowed, it is rotated 90
                  degrees. A card in this latter state is considered bowed.
                </p>
                <ul>
                  <li>
                    A bowed card cannot bow again until it is ready. Cards are typically readied by
                    a game step or card ability.
                  </li>
                  <li>During conflicts, bowed characters do not contribute their skill.</li>
                  <li>
                    A bowed attachment with skill modifiers still modifies the skill of the attached
                    character.
                  </li>
                  <li>
                    A card ability on a bowed card is active and can still engage with the game
                    state. However, if a bowed card must bow as part of its cost to trigger an
                    ability, it cannot bow again until it is readied, so the ability could not be
                    triggered.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Cancel" />
                <p>
                  Some card abilities can "cancel" other card or game effects. Cancel abilities
                  interrupt the initiation of an effect, and prevent the effect from initiating.
                  Because of this, cancel abilities have timing priority over <em>all</em> other
                  interrupts to the effect that is attempting to initiate.
                </p>
                <ul>
                  <li>
                    If an effect is canceled, that effect is no longer imminent, and further
                    interrupts (including cancels) cannot be initiated in reference to the canceled
                    effect.
                  </li>
                  <li>
                    If the effects of an ability are canceled, the ability is still considered to
                    have been used, and any costs have still been paid.
                  </li>
                  <li>
                    If the effects of an event card are canceled, the card is still considered to
                    have been played, and it is still placed in its owner's discard pile.
                  </li>
                  <li>
                    If a ring effect that is resolving for winning a conflict is canceled, the ring
                    is still claimed.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Cannot" />
                <p>
                  The word "cannot" is absolute, and cannot be countermanded by other abilities or
                  effects.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Cardtypes" />
                <p>
                  The game's cardtypes are: character, attachment, holding, event, province,
                  stronghold, and role. Each of these cardtypes, with a detailed card anatomy, is
                  presented in "<a href="#appendix-ii-card-anatomy">Appendix II: Card Anatomy</a>".
                </p>
                <ul>
                  <li>
                    If an ability causes a card to change its cardtype, the card loses all other
                    cardtypes it might possess and functions as would any card of the new cardtype.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Challenge" />
                <p>
                  Some card abilities use the word "challenge" to begin the process of resolving a
                  duel between two characters. For the rules on how to resolve a duel, see "
                  <a href="#duel-timing">Duel timing</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Character Cards" />
                <p>
                  Character cards represent the bushi, courtiers, shugenja, monks, shinobi, armies,
                  creatures, and other personalities and groups one might encounter in Rokugan.
                </p>
                <ul>
                  <li>
                    Characters played from a player’s provinces can only be played during the
                    dynasty phase. Characters played from a player’s hand can only be played during
                    any action window outside of the dynasty phase.
                  </li>
                  <li>
                    Character cards generally enter play ready and in a player's home area, and
                    remain in play unless removed by an ability or game step.
                  </li>
                  <li>
                    When a player plays a character from his or her hand during a conflict, the
                    player has the option to play it directly into the conflict, ready and
                    participating on his or her side.
                  </li>
                  <li>
                    When a player plays a character in a team conquest format game, that player
                    chooses to either play it under their own control or under the control of a
                    teammate. Once played, control cannot be exchanged except by card effects. Fate
                    is placed on the character from the fate pool of the player playing the
                    character, regardless of which player controls it.
                  </li>
                </ul>
                <p>
                  For character card anatomy, see "
                  <a href="#appendix-ii-card-anatomy">Appendix II: Card Anatomy</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Choose" />
                <p>
                  The word "choose" indicates that one or more targets must be chosen in order to
                  resolve an ability.
                </p>
                <p>
                  <b>Related:</b> <a href="#target">Target</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Clan" />
                <p>There are 7 clans in the core set, as depicted in the chart below.</p>
                <p>
                  A player's stronghold card signals which clan a player has chosen as the primary
                  clan for his or her deck. The clans and their associated symbols are listed below.
                </p>
                <ul>
                  <li>
                    An "in-clan" card bears a clan symbol that matches the clan symbol on its
                    controller's stronghold card.
                  </li>
                  <li>
                    An "out-of-clan" card bears one or more clan symbols that do not match the clan
                    symbol on its controller's stronghold card, and does not bear a clan symbol that
                    matches the clan symbol on its controller's stronghold card.
                  </li>
                  <ul>
                    <li>
                      If a player does not have a stronghold card, “in-clan” and “out-of-clan”
                      determination is defined by the clan selected during deckbuilding to be that
                      player’s primary clan.
                    </li>
                  </ul>
                </ul>
                <p>
                  <b>Related:</b> <a href="#deckbuilding">Deckbuilding</a>
                </p>
                <table style={{ width: '22em', borderSpacing: '0.5em' }}>
                  <thead>
                    <tr>
                      <th>Clan</th>
                      <th>In Text</th>
                      <th>On Card</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Crab Clan</td>
                      <td>[crab]</td>
                      <td>
                        <span className="icon icon-clan-crab" />
                      </td>
                    </tr>
                    <tr>
                      <td>Crane Clan</td>
                      <td>[crane]</td>
                      <td>
                        <span className="icon icon-clan-crane" />
                      </td>
                    </tr>
                    <tr>
                      <td>Dragon Clan</td>
                      <td>[dragon]</td>
                      <td>
                        <span className="icon icon-clan-dragon" />
                      </td>
                    </tr>
                    <tr>
                      <td>Lion Clan</td>
                      <td>[lion]</td>
                      <td>
                        <span className="icon icon-clan-lion" />
                      </td>
                    </tr>
                    <tr>
                      <td>Phoenix Clan</td>
                      <td>[phoenix]</td>
                      <td>
                        <span className="icon icon-clan-phoenix" />
                      </td>
                    </tr>
                    <tr>
                      <td>Scorpion Clan</td>
                      <td>[scorpion]</td>
                      <td>
                        <span className="icon icon-clan-scorpion" />
                      </td>
                    </tr>
                    <tr>
                      <td>Unicorn Clan</td>
                      <td>[unicorn]</td>
                      <td>
                        <span className="icon icon-clan-unicorn" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Composure" />
                <p>
                  Composure is a variable keyword ability. A card with this keyword gains an
                  additional ability while its controller’s honor bid is lower than that of one of
                  his or her opponents.
                </p>
                <ul>
                  <li>
                    Most uses of the composure keyword grant a constant ability that modifies a
                    character’s skills or glory. Some may grant triggered abilities that can only be
                    used while a player has composure.
                  </li>
                  <li>
                    “You have composure" is the phrase indicating that a player’s composure keyword
                    is active. It is used in reminder text to indicate that a player’s card has the
                    ability granted by composure while their honor bid is lower than an opponent’s.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Conflict" />
                <p>
                  During the conflict phase, each player has two opportunities to declare a conflict
                  against an opponent. For the rules on how to resolve conflicts, see{' '}
                  <a href="#framework-details">Framework Details</a>.
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Conflicts at Multiple Provinces"
                />
                <p>
                  When a conflict is at multiple provinces, each of those provinces is the "attacked
                  province" and abilities that interact with the conflict being at those provinces
                  can be used.
                </p>
                <p>
                  During the resolution of a conflict at multiple provinces, compare the attacking
                  player’s excess skill against the strength of each attacked province separately to
                  determine if that province is broken.
                </p>
                <ul>
                  <li>
                    Any card ability that interacts with "the attacked province" interacts with one
                    (not both) of those provinces.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Constant Abilities" />
                <p>
                  A constant ability is any non-keyword ability whose text contains no boldface
                  timing trigger defining its ability type. A constant ability becomes active as
                  soon as its card enters play and remains active while the card is in play.
                </p>
                <ul>
                  <li>
                    Some constant abilities continuously seek a specific condition (denoted by words
                    such as "during," "if," or "while"). The effects of such abilities are active
                    any time the specified condition is met.
                  </li>
                  <li>
                    If multiple instances of the same constant ability are in play, each instance
                    affects the game state independently.
                  </li>
                  <li>
                    If a constant ability would cause a card to leave play, interrupt abilities
                    cannot be used to replace or prevent that constant ability.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Control and Ownership" />
                <p>
                  A card's owner is the player who included the card as a part of his or her deck
                  (i.e. dynasty deck, conflict deck, provinces, stronghold, role) at the beginning
                  of the game.
                </p>
                <ul>
                  <li>
                    By default, cards enter play under their owner's control. Some abilities may
                    cause cards to change control during a game.
                  </li>
                  <li>
                    A player controls the cards in his or her out-of-play game areas (such as the
                    hand, the dynasty and conflict decks, and the dynasty and conflict discard
                    piles).
                  </li>
                  <li>
                    If a card would enter an out-of-play area of a player who does not own the card,
                    the card is placed in its owner's equivalent out-of-play area instead. (For all
                    associated card ability and framework effect purposes, the card is considered to
                    have entered that opponent's out-of-play area, and only the physical placement
                    of the card is adjusted.)
                  </li>
                  <li>
                    If a participating character changes control during a conflict, it is considered
                    participating in the same conflict on the side of its new controller.
                  </li>
                  <li>
                    When a character changes control while it is in play, it remains in the same
                    state as it was before (i.e., bowed or ready, participating or at home, etc.),
                    and is now under the new player's control.
                  </li>
                  <li>
                    Attachments on a card that changes control do not themselves change control.
                  </li>
                  <li>
                    Unless a duration is specified, a control change persists as long as the card
                    remains in play.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Copy (of a card)" />
                <p>
                  A copy of a card is defined by title: any other card that shares the same title is
                  considered a copy, regardless of card type, text, deck of origin, artwork, or any
                  other characteristic(s) of the card(s).
                </p>
                <ul>
                  <li>A card is considered to be a copy of itself, as it shares its own title.</li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Copy (of a character)" />
                <p>
                  Some card abilities may cause a character to become a copy of another character.
                  When that happens, the character that is changing loses its name, cost, base
                  skills and glory, traits, clan affiliation, and ability text. It gains the name,
                  cost, base skills and glory, traits, clan affiliation,and ability text of the
                  copied character for the duration indicated by the card ability.
                </p>
                <ul>
                  <li>
                    Cards that refer to a character’s printed text (skills, traits, abilities, etc.)
                    still refer to the text physically printed on the card.
                  </li>
                  <li>
                    When a character becomes a copy of another character, only the base skills and
                    printed characteristics are copied. If the character that is changing gains
                    characteristics (such as traits or ability text) from another non-copy card
                    ability (such as an event or attachment) then those characteristics are not
                    lost.
                  </li>
                  <li>
                    A character can only become a copy of a unique character if its owner and/or
                    controller does not also own or control a copy (by title) of that unique
                    character.
                  </li>
                  <li>
                    Becoming a copy of another character replaces the character’s base skills and
                    glory. This is not applying a modifier (dashes can be replaced).
                  </li>
                  <li>
                    A character cannot become a copy of another character if both characters have
                    the same title.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Corrupted" />
                <p>
                  Corrupted is a keyword ability. A character with the corrupted keyword enters play
                  tainted. Abilities cannot be triggered from a corrupted character receiving the
                  tainted status token from this keyword, as that card enters play already with that
                  status.
                </p>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#tainted-tainted-status-token">Tainted, Tainted Status Token</a>
                  {', '}
                  <a href="#status-token">Status Token</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Cost" />
                <p>
                  A card's cost is the numerical value that dictates how much fate must be paid to
                  play the card from a player's hand or provinces.
                </p>
                <p>
                  Some triggered card abilities also have an ability cost. Any imperative
                  instruction (other than "choose...," which denotes one or more targets must be
                  chosen, or "select...," which denotes that one or more of a number of effects must
                  be selected) that appears before the dash of a triggered ability is considered a
                  part of that ability's cost. Some examples of ability cost instructions are:
                  "Bow...," "Spend...," "Sacrifice...," "Lose...," "Dishonor...," and "Discard...."
                </p>
                <ul>
                  <li>
                    Unless otherwise specified, a card effect that modifies a cost only modifies the
                    fate cost.
                  </li>
                  <li>
                    If a card has a dash as its printed fate cost, the card cannot be played. Its
                    printed fate cost is considered to be 0 for the purposes of card abilities which
                    require a numerical value.
                  </li>
                  <li>
                    When a player is paying a cost, the payment must be made with cards and/or game
                    elements that player controls. The word "friendly" is used as a reminder of this
                    in some costs.
                  </li>
                  <li>
                    If a cost requires a game element that is not in play, the player paying the
                    cost may only use game elements that are in his or her out-of-play areas or
                    token pools to pay the cost.
                  </li>
                  <li>
                    If multiple costs for a single card or ability require payment, those costs must
                    be paid simultaneously.
                  </li>
                  <li>
                    If any part of a cost payment is prevented, once all costs that can be paid are
                    paid, the process of initiating the ability or playing the card immediately ends
                    without further resolution. (If this occurs while playing a card, the card
                    remains unplayed in its owner's hand or province.)
                  </li>
                  <li>
                    An ability cannot initiate (and therefore its costs cannot be paid) if its
                    effect on its own does not have the potential to change the game state.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#additional-cost">Additional Cost</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Count" />
                <p>
                  When instructed to count a total of game values on a subset of characters, values
                  on bowed characters are not counted.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Courtesy" />
                <p>
                  Courtesy is a keyword ability. When a card with the courtesy keyword leaves play,
                  its controller gains 1 fate.
                </p>
                <ul>
                  <li>
                    The courtesy keyword resolves after the card leaves play, before reactions to
                    that card leaving play can be triggered.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Covert" />
                <p>
                  Covert is a keyword ability. When a player initiates a conflict, for each
                  character with the covert keyword he or she declares as an attacker, that player
                  may choose one character without covert controlled by the defending player. Each
                  chosen character is considered evaded by covert, and cannot be declared as a
                  defender for that conflict.
                </p>
                <ul>
                  <li>
                    When a conflict is initiated against a facedown province, resolve the covert
                    keyword before revealing that province.
                  </li>
                  <li>
                    Card abilities may be used to move characters that have been evaded by covert
                    into a conflict as defenders.
                  </li>
                  <li>
                    Covert may only be used when characters are declared as attackers. If a
                    character with covert is moved into or played into a conflict after the point at
                    which the conflict was declared, that character's covert ability does not
                    resolve.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Current" />
                <p>
                  If an ability references a "current" skill or glory count, use the players'
                  applicable specified totals at the time the ability resolves.
                </p>
                <ul>
                  <li>
                    When resolving an ability that references a "current" skill or glory count
                    during a conflict, count the skill or glory values that would be used if the
                    conflict were currently resolving.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Dash (&ndash;)" />
                <p>
                  In the text of a triggered ability, a dash (&ndash;) is used to separate the
                  criteria that are necessary to use the ability from the effect of the ability. Any
                  triggering conditions, play restrictions or permissions, costs, and targeting
                  requirements are denoted before the dash. The ability's effect is denoted after
                  the dash.
                </p>
                <p>
                  If a character has a dash (&ndash;) for a skill value, that character cannot
                  participate in, be played into, or be put into play in conflicts of that type.
                </p>
                <ul>
                  <li>
                    Should a character with a dash skill value somehow end up participating in a
                    conflict of the corresponding type, that character is immediately removed from
                    the conflict, and placed in its controller's home area in a bowed state.
                  </li>
                  <li>
                    If a character has a dash for a skill value, that skill value cannot be modified
                    by card abilities.
                  </li>
                  <li>
                    If a character has a dash for a skill value and a card ability requires a
                    numerical value for that skill, treat the card as if it had an unmodifiable
                    skill value of 0.
                  </li>
                  <li>
                    A character with a dash skill value cannot be involved in a duel of that skill
                    type.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#participating-and-cannot-participate">
                    Participating and Cannot Participate
                  </a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Deckbuilding" />
                <p>To build custom decks for Legend of the Five Rings: The Card Game:</p>
                <ul>
                  <li>A player must choose exactly 1 stronghold.</li>
                  <li>A player may use 1 role card.</li>
                  <li>
                    A player's dynasty deck must contain a minimum of 40 and a maximum of 45 cards.
                    Each of these cards must be in-clan or be neutral.
                  </li>
                  <li>
                    A player's conflict deck must contain a minimum of 40 and a maximum of 45 cards.
                    Each of these cards must be in-clan, be neutral, or be purchased from a{' '}
                    <b>single</b> other clan by using influence.
                  </li>
                  <ul>
                    <li>
                      A player's stronghold indicates the amount of influence that player may spend
                      during deckbuilding.
                    </li>
                  </ul>
                  <li>
                    No more than 3 copies of a single card by title can be included in any
                    combination in a player's dynasty and conflict decks.
                  </li>
                  <li>
                    A player cannot include more than 1 card (by card title) from the Restricted
                    List in their decks and set of provinces. Up to a full legal playset (usually 3
                    copies) of that card may be included in the appropriate deck or provinces.
                  </li>
                  <li>
                    A player's set of provinces must include exactly 5 provinces. For each element,
                    that player must choose one province associated with that element, such that all
                    five elements are represented among their set of provinces. (Each province has a
                    ring symbol in the lower right corner of the card to indicate its association.)
                    Each of these provinces must be in-clan or be neutral.
                  </li>
                  <ul>
                    <li>
                      No more than 1 copy of each province, by title, may be included in a player's
                      set of provinces.
                    </li>
                  </ul>
                  <li>
                    Any additional deckbuilding restrictions contained in the separate Imperial Law
                    document, based on the format being played, must be followed.
                  </li>
                  <li>
                    The skirmish format follows different deckbuilding rules than each other format.
                    When building decks for the skirmish format, use the following rules instead:
                  </li>
                  <ul>
                    <li>Do not include stronghold, role, or province cards.</li>
                    <li>
                      A player’s dynasty deck must contain a minimum of 30 cards and a maximum of 40
                      cards. Each of these cards must be in-clan or neutral.
                    </li>
                    <li>
                      A player’s conflict deck must contain a minimum of 30 cards and a maximum of
                      40 cards. Each of these cards must be in-clan or neutral, or be purchased from
                      a<b>single</b> other clan by using influence. (Each player has 6 influence
                      with which to purchase out-of-clan cards during deckbuilding.)
                    </li>
                    <li>
                      No more than 2 copies of a single card by title can be included in any
                      combination in a player’s dynasty and conflict decks.
                    </li>
                    <li>
                      For tournament play, each player may include up to 10 additional cards in
                      their “sideboard,” which can be used to modify the contents of their decks in
                      between games in a single match. The contents of a players’ decks and
                      sideboard combined must follow all rules outlined above.
                    </li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Deck Limits" />
                <p>
                  Up to 3 total copies of most cards (by title) may be included in a player’s
                  dynasty and/or conflict decks (2 copies instead in skirmish format). Each copy of
                  a card in either deck counts towards this limit.
                </p>
                <p>
                  If a card has the text "Limit X per deck" no more than X copies of that card may
                  be included in that player's dynasty and/or conflict decks.
                </p>
                <ul>
                  <li>
                    If X is less than the standard number of allowed copies, this phrase acts as a
                    deckbuilding restriction.
                  </li>
                  <li>
                    If X is greater than the standard number of allowed copies, this phrase acts as
                    a permission that enables a player to include more than the standard number of
                    copies.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Defender, Defending Character, Defending Player"
                />
                <p>
                  The term "defending character" refers to a character that is participating in a
                  conflict on the side of the player who controls the province that is being
                  attacked. The term "defender" is also used as shorthand for "defending character."
                </p>
                <p>
                  The term "defending player" refers to the opponent of the attacking player against
                  whom (from the attacking player's perspective) a conflict is resolving.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Delayed Effects" />
                <p>
                  Some abilities contain delayed effects. Such abilities specify a future timing
                  point, or indicate a future condition that may arise, and dictate an effect that
                  is to happen at that time.
                </p>
                <ul>
                  <li>
                    Delayed effects resolve automatically and immediately after their specified
                    timing point or future condition occurs or becomes true, before reactions to
                    that moment may be triggered.
                  </li>
                  <li>
                    When a delayed effect resolves, it is not treated as a new triggered ability,
                    even if the delayed effect was originally created by a triggered ability.
                  </li>
                  <li>
                    When a delayed effect resolves, it is still considered to be an ability
                    originating from the cardtype of the card that created the delayed effect.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Dire" />
                <p>
                  Dire is a variable keyword ability. A card with this keyword gains an additional
                  ability while that character has no fate on it.
                </p>
                <ul>
                  <li>
                    Most uses of the dire keyword grant a constant ability that is active while the
                    character has no fate on it. Some may instead grant triggered abilities that can
                    only be used while the character has no fate on it.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Discard Piles" />
                <p>
                  The discard piles are out-of-play areas. Each player has a dynasty discard pile
                  and a conflict discard pile.
                </p>
                <ul>
                  <li>
                    Any time a card is discarded (from play, or from an out-of-play area such as a
                    hand or deck), it is placed faceup on top of its owner's appropriate discard
                    pile: dynasty cards are discarded to the dynasty discard pile, and conflict
                    cards are discarded to the conflict discard pile.
                  </li>
                  <li>
                    Each player's discard pile is open information, and may be looked at by any
                    player at any time.
                  </li>
                  <li>
                    The order of cards in a player's discard pile may be changed by that player.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Disguised" />
                <p>
                  The disguised keyword appears on unique characters. When a character is played
                  using the disguised keyword, it replaces a non-unique character of the correct{' '}
                  <em>Trait</em> or clan affiliation, inheriting all of that character’s
                  attachments, fate, and status tokens. This is an alternate means by which to play
                  a character and carries a number of unique rules including, but not limited to, an
                  additional cost of choosing and discarding a non-unique character to discard when
                  the disguised character enters play.
                </p>
                <ul>
                  <li>
                    When playing a character using the disguised keyword, you may play that
                    character during the conflict phase, following all timing rules which apply to
                    playing characters from hand.
                  </li>
                  <li>
                    To play a character using the disguised keyword, you must choose a non-unique
                    character you control of the appropriate
                    <em>Trait</em> or clan affiliation as an additional cost to play the character.
                    Reduce the cost to play the disguised character by the printed cost of the
                    chosen character, pay that cost, the disguised character enters play, then move
                    all attachments and tokens (fate, status, etc.) from the chosen character to the
                    disguised character. Finally, discard the chosen character from play. Interrupts
                    cannot be used to replace or prevent this discard.
                  </li>
                  <li>
                    A character played using the disguised keyword cannot be played into a conflict
                    unless the character chosen by the keyword was also participating in the
                    conflict, and fate from your fate pool cannot be put on it.
                  </li>
                  <li>A character played using this keyword enters play ready.</li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Dishonored, Dishonored Status Token"
                />
                <p>
                  See "
                  <a href="#personal-honor-personal-dishonor">Personal Honor, Personal Dishonor</a>
                  ".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Drawing cards" />
                <p>
                  When a player is instructed to draw one or more cards, those cards are drawn from
                  the top of his or her conflict deck.
                </p>
                <ul>
                  <li>
                    When a player draws 2 or more cards as the result of a single ability or game
                    step, those cards are drawn simultaneously.
                  </li>
                  <li>Drawn cards are added to a player's hand.</li>
                  <li>There is no limit to the number of cards a player may draw each round.</li>
                  <li>There is no maximum hand size.</li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#running-out-of-cards">Running Out of Cards</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Duel" />
                <p>
                  Some card abilities initiate a duel between two (or more) characters. For the
                  rules on how to initiate and resolve a duel, see "
                  <a href="#duel-timing">D. Duel Timing</a>".
                </p>
                <ul>
                  <li>
                    Most card abilities that initiate a duel use the phrase “initiate a [type]
                    duel." The characters chosen during duel initiation are considered to be chosen
                    as targets of the ability that initiates the duel.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Duplicates" />
                <p>
                  A duplicate is a copy (in a player's hand or provinces) of a unique character that
                  is already in play and under the same player's control. A player may, as a player
                  action during step 1.4 of the dynasty phase, discard a duplicate from his or her
                  hand or provinces to place 1 fate on the copy of the character in play.
                </p>
                <ul>
                  <li>
                    After discarding a duplicate from a province, the province refills face down.
                  </li>
                  <li>
                    A different version of a unique card (that shares the same title) may be
                    discarded from a player's hand or provinces as a duplicate.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#unique-cards">Unique Cards</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Effects" />
                <p>
                  A card effect is any effect that arises from the resolution of ability text
                  printed on or gained by a card. A framework effect is any effect that arises from
                  the resolution of a framework step.
                </p>
                <ul>
                  <li>
                    Card effects might be preceded by costs, triggering conditions, play
                    restrictions or permissions, and/or targeting requirements. Such elements are
                    not considered effects.
                  </li>
                  <li>
                    Once an ability is initiated, players must resolve as much of each aspect of its
                    effect as they are able, unless the effect uses the word "may."
                  </li>
                  <li>
                    When a non-targeting effect attempts to engage a number of entities (such as
                    "search the top 10 cards of your conflict deck") that exceeds the number of
                    entities that currently exist in the specified game area, the effect engages as
                    many entities as possible.
                  </li>
                  <li>
                    The expiration of a lasting effect (or the cessation of a constant ability) is
                    not considered to be generating a game state change by a card effect.
                  </li>
                  <li>
                    If an ability instructs a player to pick among multiple effects, an effect that
                    has the potential to change the game state must be picked.
                  </li>
                  <li>
                    Unless an effect uses the word “then" or the phrase “if you do," all effects of
                    a card ability are resolved simultaneously. The decision whether to resolve any
                    optional effects (usually indicated by the word “may") is made before applying
                    the results of the ability’s effects.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Eminent" />
                <p>
                  Eminent is a keyword ability that can be found on province cards. A province with
                  this keyword cannot be a player’s stronghold province, starts the game faceup, and
                  cannot be turned facedown.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Enters Play" />
                <p>
                  The phrase "enters play" refers to any time a card makes a transition from an
                  out-of-play area or state into play. Playing a card and putting a card into play
                  by using a card ability are two means by which a card may enter play.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Event Cards" />
                <p>
                  Event cards represent tactical acts and maneuvers, court intrigues, spells,
                  supernatural occurrences, and other unexpected developments that might occur
                  during a game.
                </p>
                <ul>
                  <li>
                    Event cards are triggered from a player's hand or provinces. An event card's
                    ability type, triggering condition (if any), and play permissions/restrictions
                    (if any), and originating location define when and how the card may be played.
                  </li>
                  <li>
                    Event cards with action abilities may be played from a player’s hand during any
                    action window.
                  </li>
                  <ul>
                    <li>
                      In the skirmish format, event cards with action abilities cannot be played
                      from a player’s hand during the dynasty phase.
                    </li>
                  </ul>
                  <li>
                    Event cards played from a player’s provinces cannot be played outside of the
                    dynasty phase.
                  </li>
                  <li>
                    When an event card is played, its costs are paid, its effects are resolved (or
                    canceled), and it is placed in its owner's appropriate discard pile prior to
                    opening the reaction window which follows the ability's resolution.
                  </li>
                  <li>
                    Lasting effects, including those created by event cards engage the game state at
                    the time they resolve. If an event card creates a lasting effect on a set of
                    cards, only cards that are in play (or in the affected game area or game state)
                    at the time the event is played are eligible to be affected. Cards that enter
                    play (or the affected game area or game state) after the resolution of the event
                    are not affected by its lasting effect.
                  </li>
                  <li>
                    If the effects of an event card are canceled, the card is still considered to
                    have been played, and its costs remain paid, and the card is still discarded.
                    Only the effects have been canceled.
                  </li>
                  <li>
                    Unless the ability that puts it into play also changes its cardtype to a
                    cardtype that is permitted in play, an event card cannot enter play.
                  </li>
                </ul>
                <p>
                  For event card anatomy, see "
                  <a href="#appendix-ii-card-anatomy">Appendix II: Card Anatomy</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Facedown Province" />
                <p>
                  A facedown province card has no inherent identity other than "facedown province."
                  When a facedown province is turned faceup, that province card is considered to be
                  revealed.
                </p>
                <ul>
                  <li>
                    A facedown province is turned faceup when an attack is declared against it.
                  </li>
                  <li>
                    A player may look at the facedown provinces under his or her control at any
                    time.
                    <b>Note:</b> this rule refers to the facedown province card itself. A player is
                    not permitted to look at facedown dynasty cards in his or her provinces.
                  </li>
                  <li>
                    If a facedown province becomes the attacked province in a manner other than the
                    declaration of an attack, immediately turn the province faceup.
                  </li>
                  <li>
                    A facedown province is considered to be a different entity than its faceup side.
                    While a province is facedown, its faceup side is considered to be out of play.
                    When a province is turned faceup, the "faceup province" and "facedown province"
                    simultaneously exchange positions, such that the facedown province is now out of
                    play and the faceup province is now in play. The opposite is true when a
                    province is turned facedown.
                  </li>
                  <li>
                    Province tokens in the skirmish format are never considered to be facedown and
                    are never revealed.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Fate" />
                <p>
                  Fate is the game's basic resource, and is used to pay for cards and some card
                  abilities. The amount of fate a player has available at any given time is
                  represented (as open information) by fate tokens in his or her fate pool.
                </p>
                <ul>
                  <li>
                    Fate begins the game in the general token pool. When a player gains fate, that
                    player takes that much fate from the general token pool and adds it to his or
                    her fate pool.
                  </li>
                  <li>
                    When a player is instructed to place fate on a card, that fate comes from the
                    general token pool unless otherwise specified.
                  </li>
                  <li>
                    When fate is spent or lost, it is usually returned to the general token pool. If
                    fate is spent to a ring, it is placed on that ring.
                  </li>
                  <li>
                    Whenever a player plays a character from his or her hand or provinces, after
                    that character enters play, that player has the option of placing any number of
                    fate from his or her fate pool onto that character.
                  </li>
                  <li>
                    During the fate phase, each character with no fate on it is discarded.
                    Subsequently, 1 fate is removed from each character in play. Finally, 1 fate
                    from the general token pool is placed on each unclaimed ring.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Fill a Province" />
                <p>
                  If a player is instructed to fill a province, that player takes the top card of
                  their dynasty deck and places it facedown (without looking at it) on the province.
                </p>
                <ul>
                  <li>
                    A player can fill a province even if that province already has 1 or more dynasty
                    cards in it.
                  </li>
                  <li>
                    If a player is instructed to fill a province faceup, the dynasty card is placed
                    in the province faceup rather than facedown.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="First Player, First Player Token"
                />
                <p>
                  A first player is chosen during setup, and the first player token is used to
                  indicate that player's status as the first player. The chosen player remains first
                  player until they pass the first player token to the player on their left during
                  the fate phase.
                </p>
                <ul>
                  <li>
                    The first player becomes the active player first during the dynasty phase and
                    the conflict phase.
                  </li>
                  <li>
                    The first player has the first opportunity to initiate actions or act first
                    during all non-conflict resolution action windows. While a conflict is
                    resolving, the defending player has the first opportunity to initiate actions
                    during each conflict resolution action window.
                  </li>
                  <li>
                    The first player has the first opportunity to initiate interrupt or reaction
                    abilities at each appropriate game moment.
                  </li>
                  <li>
                    For any question as to who should perform an act or make a decision first, in
                    the absence of any other direction by card or rules text, the first player does
                    so first, followed by the player to the first player’s left and continuing in
                    clockwise order.
                  </li>
                  <li>
                    In the team conquest format, the first player token is given to a team rather
                    than a player. Each player on that team is considered to be the first player.
                    During action windows, each team has an action opportunity (rather than each
                    player). When a team wishes to take an action, one of the players on that team
                    takes the action, then a player on the opposing team has an opportunity to take
                    an action. This continues until both teams pass in sequence, and the action
                    window closes.
                  </li>
                  <ul>
                    <li>
                      At the end of the fate phase, the first player token is passed to the opposing
                      team and they become the firstplayer team.
                    </li>

                    <li></li>
                  </ul>
                </ul>
                <p>
                  <b>Related:</b> <a href="#active-player">Active Player</a>,
                  <a href="#setup">Setup</a>,
                  <a href="#priority-of-simultaneous-resolution">
                    Priority of Simultaneous Resolution
                  </a>
                  , <a href="#appendix-i-timing-and-gameplay">Appendix I</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Forced (Forced Interrupts, Forced Reactions)
            "
                />
                <p>
                  While most triggered abilities are optional, some interrupt and reaction abilities
                  are preceded by the word "<b>Forced</b>." Such abilities must be resolved
                  immediately whenever the triggering condition specified in the ability text
                  occurs.
                </p>
                <ul>
                  <li>
                    For any given triggering condition, forced interrupts take priority and initiate
                    before non-forced interrupts, and forced reactions take priority and initiate
                    before non-forced reactions.
                  </li>
                  <li>
                    If two or more forced and/or mandatory abilities (such as keywords) would
                    initiate at the same moment, the first player determines the order in which the
                    abilities initiate, regardless of who controls the cards bearing those
                    abilities.
                  </li>
                  <li>
                    Each forced ability must resolve completely before the next forced ability to
                    the same triggering condition may initiate.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#interrupts">Interrupts</a>,
                  <a href="#reactions">Reactions</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Framework Effects and Framework Steps"
                />
                <p>
                  A framework step is a mandatory occurrence, dictated by the structure of the game.
                  A framework effect is any effect that arises from the resolution of a framework
                  step.
                </p>
                <p>
                  <b>Related:</b> <a href="#appendix-i-timing-and-gameplay">Appendix I</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Gains" />
                <p>The word "gains" is used in multiple contexts.</p>
                <ul>
                  <li>
                    If a player gains fate or honor, that player takes the specified amount of fate
                    or honor and adds it to their fate pool or honor pool. Unless that player is
                    gaining the fate or honor from a specific source, the token is taken from the
                    general token pool.
                  </li>
                  <li>
                    If a card gains a characteristic (such as a <em>Trait</em>, a keyword, or
                    ability text), the card functions as if it possesses the gained characteristic.
                    Gained characteristics are not considered to be printed on the card.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#give">Give</a>,<a href="#loses">Loses</a>,{' '}
                  <a href="#printed">Printed</a>,<a href="#take">Take</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Give" />
                <p>
                  If a player is instructed to give tokens to another player, those tokens are
                  removed from the giving player’s pool of tokens (or specified game area), and are
                  added to the other player’s token pool.
                </p>
                <ul>
                  The player giving the tokens is considered to be losing the tokens and the other
                  player is considered to be gaining the tokens.
                </ul>
                <p>
                  <b>Related:</b> <a href="#gains">Gains</a>,<a href="#loses">Loses</a>,{' '}
                  <a href="#take">Take</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Glory" />
                <p>
                  Glory is a character statistic that represents a character's reputation, and how
                  much the character cares about their reputation.
                </p>
                <ul>
                  <li>
                    While a character is honored or dishonored, that character's glory will modify
                    its military and political skill.
                  </li>
                  <li>
                    A player counts the glory value of each ready character he or she controls
                    whenever a glory count is required.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#personal-honor-personal-dishonor">Personal Honor, Personal Dishonor</a>,
                  <a href="#glory-count">Glory Count</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Glory Count" />
                <p>
                  When the players are asked to perform a glory count, each player or each team
                  counts the total glory value among the ready characters they control and adds 1 to
                  the total for each ring in their claimed ring pool. The player or team with the
                  highest total wins the glory count.
                </p>
                <ul>
                  <li>
                    <a href="#3-4-1-glory-count">Step 3.4.1</a> of the conflict phase consists of a
                    framework glory count. The winner of this count claims the Imperial Favor and
                    may set it to either side if appropriate.
                  </li>
                  <ul>
                    <li>
                      If players have the same total, the Imperial Favor remains in its current
                      state (either unclaimed or under the possession of the player who currently
                      has it, remaining set on its current side).
                    </li>
                  </ul>
                  <li>
                    Some card abilities may require the players to perform a glory count. Glory
                    counts required by card abilities are made in the same manner, and the ability
                    will detail how to process the result. Such counts do not affect the status of
                    the Imperial Favor, unless the ability text causes the Imperial Favor status to
                    change.
                  </li>
                  <li>
                    Other card abilities may require players to count current glory among their
                    characters, or a subset of their characters. This is different from a glory
                    count, and rings in a player's claimed ring pool are not added. For such card
                    abilities, players count current glory among their specified characters in the
                    same way they would count current{' '}
                    <span className="icon icon-conflict-military" /> or{' '}
                    <span className="icon icon-conflict-political" /> skill.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#imperial-favor-imperial-favor-contest">Imperial Favor</a>,
                  <a href="#current">Current</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Holding" />
                <p>
                  When a holding is turned faceup in a player's province, its game text becomes
                  active and that holding is considered to be "in play." As long as a holding
                  remains faceup in a player's province, that player can use abilities or benefit
                  from game text on that holding.
                </p>
                <ul>
                  <li>
                    Many holdings have a statistical value that modifies the defense strength of the
                    province at which the holding is located.
                  </li>
                  <li>
                    During the regroup phase, when discarding faceup cards from his or her
                    provinces, a player may choose to discard a faceup holding. When this occurs,
                    the province is refilled, facedown, with the top card of that player's Dynasty
                    deck, as normal.
                  </li>
                  <li>While a holding remains on a province, that province is not refilled.</li>
                </ul>
                <p>
                  For holding card anatomy, see "
                  <a href="#appendix-ii-card-anatomy">Appendix II: Card Anatomy</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Home, Move Home" />
                <p>
                  Character cards that are in play but not currently participating in a conflict are
                  considered to be in their controller's home area.
                </p>
                <ul>
                  <li>
                    If a character that is participating in a conflict is moved home, it is removed
                    from the conflict and placed in its controller's home area. A character that is
                    moved home maintains its status of bowed or readied.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Honor" />
                <p>
                  Honor represents the behavior of a player's clan, and the outward perception of
                  that behavior. It is bid during the draw phase (see framework step "
                  <a href="#2-2-honor-bid">2.2. Honor bid</a>") and during duels. Honor also serves
                  as a victory track to measure an honor win or an honor loss. The amount of honor a
                  player has at any given time is represented (as open information) by honor tokens
                  in his or her honor pool.
                </p>
                <ul>
                  <li>
                    A player's stronghold indicates that player's starting honor total. In the
                    skirmish format, each player starts with 6 honor.
                  </li>
                  <li>
                    Each time a player gains honor, that honor is taken from the general token pool
                    and added to the player's honor pool. Each time a player loses honor, that honor
                    is taken from the player's honor pool and returned to the general token pool.
                  </li>
                  <li>
                    If a card ability references a player who is more or less honorable than another
                    player, the players compare the amount of honor in each of their honor pools to
                    determine if the ability is applicable, or to whom the ability refers.
                  </li>
                  <li>
                    If a card ability references a player's honor bid, the ability is referencing
                    the current setting on the player's honor dial.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#winning-the-game">Winning the Game</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Honored, Honored Status Token"
                />
                <p>
                  See "
                  <a href="#personal-honor-personal-dishonor">Personal Honor, Personal Dishonor</a>
                  ".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Immune" />
                <p>
                  If a card is immune to a specified set of effects (for example, "immune to ring
                  effects" or "immune to event card effects"), it cannot be targeted or affected by
                  effects that belong to that set.
                </p>
                <ul>
                  <li>
                    Immunity only protects the immune card itself. Peripheral entities associated
                    with an immune card (such as attachments, tokens on the card, and abilities that
                    originate from the immune card) are not themselves immune.
                  </li>
                  <li>
                    If a card gains immunity to an effect, pre-existing lasting effects that have
                    been applied to the card are not removed.
                  </li>
                  <li>
                    Immunity only protects a card from effects. It does not prevent a card from
                    being used to pay costs.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Imperial Favor, Imperial Favor Contest
            "
                />
                <p>
                  The Imperial Favor represents which player currently holds the favor of the
                  Emperor. <a href="#3-4-1-glory-count">Step 3.4.1</a> of the conflict phase
                  consists of a framework glory count. The winner of this count claims the Imperial
                  Favor and may set it to either side if appropriate.
                </p>
                <ul>
                  <li>
                    The +1 skill modifier granted by the Imperial Favor applies to any conflict of
                    the specified type in which its bearer controls at least one participating
                    character. This modifier applies to the
                    <em>player's</em> total skill that is counted for the conflict, but does not
                    modify the skill value of any of the characters participating in the conflict.
                  </li>
                  <li>
                    Once the Imperial Favor is set to its military or political side, it must remain
                    on that side until it is claimed again or changed by a card ability.
                  </li>
                  <li>
                    If a player in possession of the Imperial Favor wins the framework glory count
                    in the conflict phase, that player claims the Imperial Favor again and may set
                    it to either side.
                  </li>
                  <li>
                    If players have the same total, the Imperial Favor remains in its current state
                    (either unclaimed or under the possession of the player who currently has it,
                    remaining set on its current side).
                  </li>
                  <li>The game begins with the Imperial Favor unclaimed.</li>
                  <li>
                    If a card ability causes the Imperial Favor to be claimed, it may be claimed
                    from its unclaimed status, or claimed from a player. Each time the Imperial
                    Favor is claimed, it may be set to either side.
                  </li>
                  <li>
                    If a player is instructed to discard the Imperial Favor, that player returns the
                    Imperial Favor to its unclaimed state in the token bank.
                  </li>
                  <li>
                    In the skirmish format, the Imperial Favor is not set to a side as described
                    above. Instead, the +1 skill modifier granted by the Imperial Favor applies to
                    each conflict in which its bearer controls at least one participating character,
                    regardless of conflict type.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#glory-count">Glory Count</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="In Play and Out of Play" />
                <p>
                  The cards (generally characters and attachments) that a player controls in his or
                  her play area (at home or participating in a conflict), a player's stronghold
                  card, a player's faceup province cards, and all holdings on a player's provinces
                  are considered "in play." A player's facedown provinces are considered in play
                  only as "facedown provinces," and the ability text on such cards is not considered
                  active until the card is revealed.
                </p>
                <p>
                  "Out-of-play" refers to all other cards and areas involved in the game
                  environment, including: character cards in a player's provinces, role cards, cards
                  in a player's hand, decks, discard piles, and any cards that have been removed
                  from the game.
                </p>
                <ul>
                  <li>
                    A card enters play when it transitions from an out-of-play origin to an in-play
                    state.
                  </li>
                  <li>
                    A card leaves play when it transitions from an in-play state to an out-of-play
                    destination.
                  </li>
                  <li>A player's stronghold cannot leave play.</li>
                  <li>
                    If a card enters or leaves play, any lasting effects, delayed effects, or
                    pending effects that are currently or about to interact with that card no longer
                    do so. This is also true if a card transitions from one out-of-play area to
                    another (such as going from hand to discard pile).
                  </li>
                  <li>
                    If a card would enter a deck of the incorrect deck type (conflict or dynasty),
                    it is put into the discard pile of its owner corresponding to its correct deck
                    type instead.
                  </li>
                  <li>
                    If a dynasty card would enter a player’s hand of conflict cards, it is put into
                    its owner’s discard pile instead.
                  </li>
                  <li>
                    If a conflict card would enter a player’s provinces, it is put into its owner’s
                    conflict discard pile instead.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#enters-play">Enters Play</a>,
                  <a href="#leaves-play">Leaves Play</a>,
                  <a href="#play-and-put-into-play">Play and Put Into Play</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Influence, Influence Cost"
                />
                <p>
                  Influence is a deckbuilding resource that is indicated by a player's chosen
                  stronghold for that deck. Many conflict deck cards have an influence cost, which
                  makes them eligible for selection as an out-of-clan card.
                </p>
                <p>
                  In the skirmish format, each player cannot spend more than 6 influence to include
                  out-of-clan cards in their deck.
                </p>
                <ul>
                  <li>
                    A player may spend influence up to the amount indicated by his or her stronghold
                    to include out-of-clan cards from a<em>single</em> additional clan in his or her
                    conflict deck.
                  </li>
                  <li>
                    Each copy of a card that is chosen reduces the amount of influence a player has
                    at his or her disposal to use in selecting other cards for the deck.
                  </li>
                  <li>
                    A clan-affiliated card that has no influence cost cannot be selected using
                    influence for inclusion in a deck.
                  </li>
                </ul>
                <p>
                  <i>
                    <b>Example:</b> Tom is building a Lion Clan deck, and has 10 influence to spend
                    on out-of-clan cards, as indicated by the Lion stronghold, Shiro no Yojin. He
                    must spend all of his influence on cards from a single clan. He chooses to
                    select cards from the Crane Clan. Tom decides to include 3 copies of Admit
                    Defeat (2 influence cost each), 3 copies of The Perfect Gift (1 influence cost
                    each), and 1 copy of Duelist Training (1 influence cost). As this is all of
                    Tom's influence, he cannot include any other Crane Clan cards in his conflict
                    deck. All of the other cards in Tom's conflict deck must either be from the Lion
                    Clan, or be neutral.
                  </i>
                </p>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Initiating Abilities / Playing Cards"
                />
                <p>
                  Whenever a player wishes to play a card or initiate a triggered ability, that
                  player first declares his or her intent (and shows the card to be used, if
                  necessary). There are two preliminary confirmations that must be made before the
                  process may begin. These are:
                </p>
                <ol>
                  <li>
                    Check play restrictions and verify the existence of eligible targets: can the
                    card be played, or the ability initiated, at this time? If the play restrictions
                    are not met, or there are not enough eligible targets for the ability, the
                    process cannot proceed.
                  </li>
                  <li>
                    Determine the cost (or costs, if multiple costs are required) to play the card
                    or initiate the ability. If it is established that the cost (taking modifiers
                    into account) can be paid, proceed with the remaining steps of this sequence.
                  </li>
                </ol>
                <p>
                  Once each of the preliminary confirmations has been made, follow these steps, in
                  order:
                </p>
                <ol start={3}>
                  <li>Apply any modifiers to the cost(s).</li>
                  <li>Pay the cost(s).</li>
                  <li>
                    Choose target(s), if applicable. Any pre-effect instructions to "select" among
                    multiple options in the ability are made at this time as well.
                  </li>
                  <li>
                    The card attempts to enter play, or the effects of the ability attempt to
                    initiate. An interrupt ability that cancels this initiation may be used at this
                    time.
                  </li>
                  <li>
                    The card enters play, or the effects of the ability (if not canceled in step 6)
                    complete their initiation, and resolve.
                  </li>
                  <li>At this time the card is considered "played" or the ability "triggered."</li>
                </ol>
                <p>
                  Interrupts and reactions may be used throughout this process as normal, should
                  their triggering conditions occur.
                </p>
                <p>
                  <b>Related:</b> <a href="#ability">Ability</a>,<a href="#cost">Cost</a>,{' '}
                  <a href="#effects">Effects</a>,
                  <a href="#resolve-an-ability">Resolve an Ability</a>,<a href="#target">Target</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="In Player Order" />
                <p>
                  If the players are instructed to perform a sequence “in player order,” the first
                  player performs their part of the sequence first, followed by the player to the
                  first player’s left and continuing in clockwise order.
                </p>
                <ul>
                  <li>
                    If a sequence performed in player order does not conclude after each player has
                    performed their aspect of the sequence once, the sequence of opportunities
                    continues to alternate from player to player in clockwise order until it is
                    complete.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Interrupts" />
                <p>
                  An interrupt is a triggered ability whose text is prefaced by a boldface "
                  <b>Interrupt:</b>" precursor. An interrupt ability interrupts the resolution of
                  its triggering condition, sometimes canceling or changing the resolution of that
                  condition. Always resolve interrupts to a triggering condition before resolving
                  the consequences of the triggering condition itself.
                </p>
                <p>
                  Unlike actions, which are resolved during action windows, an interrupt may be
                  initiated only if its specified triggering condition occurs, as described in the
                  interrupt ability's text.
                </p>
                <p>
                  When a triggering condition initiates (but before it completes its resolution), an
                  interrupt window for that triggering condition opens.
                </p>
                <p>
                  Within the interrupt window, the first player always has the first opportunity to
                  initiate an eligible interrupt (to the triggering condition that opened the
                  window), or pass. Opportunities to initiate an eligible interrupt, or pass,
                  continue to alternate between the players until all players consecutively pass, at
                  which point the interrupt window closes. Passing does not prevent a player from
                  initiating an eligible interrupt later in that same interrupt window.
                </p>
                <p>
                  Once an interrupt window closes, further interrupts to that specific triggering
                  condition cannot be initiated. The triggering condition now completes its
                  resolution (as long as its effects have not been canceled).
                </p>
                <ul>
                  <li>
                    Unless otherwise noted by the ability, each interrupt ability may be initiated
                    once each round. (This includes forced interrupts.)
                  </li>
                  <li>
                    An interrupt with specified limit that enables it to be triggered more than once
                    per round may only be initiated once each time its specified triggering
                    condition occurs.
                  </li>
                  <ul>
                    <li>
                      If multiple players can trigger an interrupt ability, each may do so to the
                      same triggering condition.
                    </li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Keywords" />
                <p>
                  A keyword is a card ability which conveys specific rules to its card. The keywords
                  in the game are:
                  <a href="#ancestral">Ancestral</a>,<a href="#composure">Composure</a>,
                  <a href="#courtesy">Courtesy</a>, <a href="#covert">Covert</a>,
                  <a href="#disguised">Disguised</a>, <a href="#eminent">Eminent</a>,
                  <a href="#limited">Limited</a>,<a href="#no-attachments">No Attachments</a>,
                  <a href="#pride">Pride</a>, <a href="#rally">Rally</a>,
                  <a href="#restricted">Restricted</a>,<a href="#sincerity">Sincerity</a>, and
                  <a href="#support">Support</a>.
                </p>
                <ul>
                  <li>
                    Sometimes a keyword is followed by reminder text, which is presented in italics.
                    Reminder text is a shorthand explanation of how a keyword works, but it is not
                    rules text and does not replace the rules for that keyword in this glossary.
                  </li>
                  <li>
                    Keywords that resolve based on the occurrance of a triggering condition (such as
                    a character leaving play) resolve immediately after the triggering condition
                    occurs, before triggering any reaction abilities.
                  </li>
                  <li>
                    A card can have multiple instances of the same keyword. However, a card that
                    does so functions as if it has one instance of that keyword, and the keyword
                    will only resolve once per triggering condition. Variable keywords (see below)
                    are an exception: if a card has multiple instances of a variable keyword, each
                    of those instances acts on the card independently.
                  </li>
                  <li>
                    Some keywords, such as Composure, are variable keywords. Variable keywords
                    operate in the same way as other keywords, but their effects are unique on a
                    card-by-card basis. Each variable keyword has the same condition in which they
                    become active, but different effects based on the individual card’s text.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Lasting Effects" />
                <p>
                  Some abilities create conditions that affect the game state for a specified
                  duration. Such effects are known as lasting effects.
                </p>
                <ul>
                  <li>
                    A lasting effect persists beyond the resolution of the ability that created it,
                    for the duration specified by the effect. The effect continues to affect the
                    game state for the specified duration regardless of whether the card that
                    created the lasting effect is or remains in play.
                  </li>
                  <li>
                    If a lasting effect affects in-play cards (or a specified set of cards), it is
                    only applied to cards that are in play (or that meet the specifications of the
                    set) at the time the lasting effect is established. Cards that enter play (or
                    change status to meet the criteria of the specified set) after a lasting
                    effect's establishment are not affected by that lasting effect.
                  </li>
                  <li>
                    A lasting effect expires as soon as the timing point specified by its duration
                    is reached. This means that an "until the end of the phase" lasting effect
                    expires before an "at the end of the phase" ability or delayed effect may
                    initiate.
                  </li>
                  <li>
                    A lasting effect that expires at the end of a specified time period can only be
                    initiated during that time period.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Leaves Play" />
                <p>
                  The phrase "leaves play" refers to any time a card makes a transition from an
                  in-play state to an out-of-play destination.
                </p>
                <p>
                  If a card leaves play, the following consequences occur simultaneously with the
                  card leaving play:
                </p>
                <ul>
                  <li>All tokens on the card are returned to the general token pool.</li>
                  <li>
                    All non-ancestral attachments on the card are discarded. All ancestral
                    attachments on the card are returned to their owners' hands.
                  </li>
                  <li>
                    All lasting effects and/or delayed effects affecting the card while it was in
                    play expire for that card.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Limited" />
                <p>
                  Limited is a keyword ability. No more than one card in total with the limited
                  keyword can be played by each player each round. Cards played from hand and played
                  from a player's provinces are restricted by and count toward this limit.
                </p>
                <li>
                  Limited cards that are "put into play" via card abilities ignore and are ignored
                  by this restriction.
                </li>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Limit X per [period]" />
                <p>
                  This phrase specifies the number of times a triggered ability can be used during
                  the designated period. This replaces the general restriction of using a triggered
                  ability once per game round.
                </p>
                <ul>
                  <li>
                    Each copy of an ability with a specified limit may be used the specified number
                    of times during the specified period.
                  </li>
                  <li>
                    If a card leaves play and re-enters play during the same period, or if a card
                    transitions from one out-of-play area to another (such as going from hand to
                    discard pile), it is considered a new instance of the card. There is no memory
                    of having used the ability during the specified period for any new instance of a
                    card.
                  </li>
                  <li>All limits are player specific.</li>
                  <li>
                    If the effects of an ability with a limit are canceled, the use of the ability
                    is still counted against the limit.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#limits-of-triggered-abilities">Limits of Triggered Abilities</a>,
                  <a href="#max-x-per-period">Max X per [period]</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Limits of Triggered Abilities"
                />
                <p>
                  Unless otherwise specified, each triggered ability can only be used once per game
                  round. This general restriction applies to any triggered ability that does not
                  have “Limit X per [period]" printed as part of the ability’s text.
                </p>
                <ul>
                  <li>
                    If a card leaves play and re-enters play during the same period, or if a card
                    transitions from one out-of-play area to another (such as going from hand to
                    discard pile), it is considered a new instance of the card. There is no memory
                    of having used the ability for any new instance of a card for the purposes of
                    this general restriction.
                  </li>
                  <li>
                    If a card triggers its ability from a hidden out-of-play area (such as a hand or
                    deck) but does not leave that hidden area, that ability may be triggered again
                    because it is considered a new instance of the card.
                  </li>
                  <li>All limits are player specific.</li>
                  <li>
                    If the effects of an ability are canceled, the use of the ability is still
                    counted against the general restriction of only once per game round.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#limit-x-per-period">Limit X per [period]</a>
                  <a href="#max-x-per-period">Max X per [period]</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Loses" />
                <p>
                  If a player loses fate or honor, that player takes the specified amount of fate or
                  honor and removes it from their fate pool or honor pool. Unless that player is
                  moving the fate or honor to a specific destination, the token is returned to the
                  general token pool.
                </p>
                <ul>
                  When tokens are removed from a card, that card is considered to lose those tokens.
                  If the tokens are not moved to a specific destination, return them to the general
                  token pool.
                </ul>
                <p>
                  <b>Related:</b> <a href="#gains">Gains</a>,<a href="#give">Give</a>,{' '}
                  <a href="#take">Take</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Max X per [period]" />
                <p>
                  This phrase imposes a maximum number of times that an ability may be initiated
                  from all copies (by title) of cards bearing the ability (including itself), during
                  the designated period. Initiating an ability on a card counts toward the maximum
                  for all copies of that card.
                </p>
                <ul>
                  <li>Each maximum is player specific.</li>
                  <li>
                    If the effects of a card or ability with a maximum are canceled, the use of the
                    card or ability is still counted against the maximum.
                  </li>
                  <li>An ability's maximum value cannot be modified.</li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#limit-x-per-period">Limit X per [period]</a>,
                  <a href="#limits-of-triggered-abilities">Limits of Triggered Abilities</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="May" />
                <p>
                  The word "may" indicates that a specified player has the option to do that which
                  follows. If no player is specified, the option is granted to the controller of the
                  card with the ability in question.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Modifiers" />
                <p>
                  Some abilities may ask players to modify values. The game state constantly checks
                  and (if necessary) updates the count of any variable quantity that is being
                  modified.
                </p>
                <p>
                  Any time a new modifier is applied (or removed), the entire quantity is
                  recalculated from the start, considering the unmodified base value and all active
                  modifiers.
                </p>
                <ul>
                  <li>
                    The calculation of a value treats all modifiers as being applied simultaneously.
                    However while performing the calculation, all additive and subtractive modifiers
                    should be calculated before doubling and/or halving modifiers are calculated.
                  </li>
                  <li>Fractional values are rounded up after all modifiers have been applied.</li>
                  <li>
                    When a value is "set" to a specific number, the set modifier overrides all
                    non-set modifiers (including any new non-set modifiers that are added during the
                    duration of the set value). If multiple set modifiers are in conflict, the most
                    recently applied set modifier takes precedence.
                  </li>
                  <li>
                    A quantity cannot be reduced so that it functions with a value below zero: a
                    card cannot have negative icons, political or military skill, glory, traits,
                    cost, or keywords. Negative modifiers that would take a value below zero can be
                    applied, but, after all active modifiers have been applied, any resultant value
                    below zero is treated as zero.
                  </li>
                  <li>
                    If a value “cannot be increased/decreased," any modifiers to that value that
                    would increase/decrease it are ignored for the duration of the “cannot be
                    increased/decreased" effect, even if those modifiers were applied before
                    applying the “cannot be increased/decreased" effect.
                  </li>
                  <ul>
                    <li>
                      “Set" modifiers are not ignored, as they do not directly increase/decrease the
                      value.
                    </li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Move" />
                <p>Some abilities allow players to move cards or tokens.</p>
                <ul>
                  <li>
                    When an entity moves, it cannot move to its same (current) placement. If there
                    is no valid destination for a move, the move attempt cannot be made.
                  </li>
                  <li>
                    When a character is moved into a conflict, that character is considered
                    participating in the conflict on its controller's side.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Mulligan" />
                <p>
                  During setup, each player has a single opportunity to mulligan any number of cards
                  in his or her provinces, and a single opportunity to mulligan any number of cards
                  in his or her hand. When a player decides to mulligan, the mulliganed cards are
                  set aside, replaced with an equal number of cards from the top of the appropriate
                  deck(s), and then shuffled back into the deck(s) from which they originated.
                </p>
                <ul>
                  <li>
                    Players mulligan (or pass the opportunity to do so) in player order. If the
                    first player passes an opportunity to mulligan, that player cannot change his or
                    her mind and then decide to mulligan during that step after seeing the
                    opponent's decision.
                  </li>
                  <li>
                    After a player mulligans the cards in their provinces, they may look at the new
                    cards before drawing their conflict hand.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Nested Ability Sequences"
                />
                <p>
                  Each time a triggering condition occurs, the following sequence is followed: (1)
                  execute any interrupts to that triggering condition, (2) resolve the triggering
                  condition itself, and then, (3) execute any reactions to that triggering
                  condition.
                </p>
                <p>
                  Within this sequence, if the use of an interrupt or reaction leads to a new
                  triggering condition, the game pauses and starts a new sequence: (1) execute
                  interrupts to the new triggering condition, (2) resolve the new triggering
                  condition itself, and then, (3) execute reactions to the new triggering condition.
                  This is called a nested sequence. Once this nested sequence is completed, the game
                  returns to where it left off, continuing with the original triggering condition's
                  sequence.
                </p>
                <p>
                  It is possible that a nested sequence generates further triggering conditions (and
                  hence more nested sequences). There is no limit to the number of nested sequences
                  that may occur, but each nested sequence must complete before returning to the
                  sequence that spawned it. In effect, these sequences are resolved in a Last In,
                  First Out (LIFO) manner.
                </p>
                <p>
                  <b>Related:</b> <a href="#interrupts">Interrupts</a>,
                  <a href="#reactions">Reactions</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Neutral" />
                <p>
                  Some cards are not affiliated with any clan, these cards are neutral. Any deck may
                  include neutral cards.
                </p>
                <ul>
                  <li>Neutral cards are not considered to be in-clan or out-of-clan.</li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="No Attachments" />
                <p>
                  No attachments is a keyword ability. A card with this keyword cannot have an
                  attachment card attached.
                </p>
                <ul>
                  <li>
                    If one or more traits precedes the word "attachments" (for example, "No{' '}
                    <em>Weapon</em> or <em>Armor</em> attachments"), the card cannot have an
                    attachment that possess one or more of the specified traits, but it can have
                    attachments possessing none of those traits.
                  </li>
                  <li>
                    If the word "attachments" is followed by the word "except" and one or more
                    traits (for example, "No attachments except
                    <em>Weapon</em>"), the card can have attachments that possess one or more of the
                    specified traits, but it cannot have attachments possessing none of those
                    traits.
                  </li>
                  <li>
                    If a card has multiple variants of the "No attachments" keyword, any variant
                    that would prevent a card from having a given attachment prevails.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Opponent" />
                <p>
                  In the stronghold format, as well as most games of the skirmish format, each
                  player has only one opponent.
                </p>
                <p>
                  In the enlightenment format, where each player has two opponents, a player’s card
                  ability that refers to “your opponent” only refers to the single opponent
                  participating against that player in a conflict. It does not refer to the player
                  not participating in the conflict.
                </p>
                <p>
                  In the team conquest format, where all players can control participating
                  characters in a conflict, a player’s card ability that refers to “your opponent”
                  or “an opponent” refers to either player on the opposing team, chosen when
                  resolving the card ability.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Ordinary" />
                <p>
                  See "
                  <a href="#personal-honor-personal-dishonor">Personal Honor, Personal Dishonor</a>
                  ".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Own, Ownership" />
                <p>
                  See "<a href="#control-and-ownership">Control and Ownership</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Participating and Cannot Participate"
                />
                <p>
                  Any character that has been declared as an attacker or defender for a conflict is
                  considered participating in that conflict through its resolution, unless it is
                  removed by an ability or game effect.
                </p>
                <ul>
                  <li>
                    Each character that is in play is either participating or not participating in
                    each conflict.
                  </li>
                  <li>
                    If an ability removes a character from a conflict or moves a character home,
                    that character is no longer participating in the conflict and is returned to its
                    controller's home area.
                  </li>
                  <li>
                    If a non-participating character is moved into a conflict, it is considered
                    participating on its controller's side.
                  </li>
                  <li>
                    If a participating character is bowed, it is still considered participating, but
                    will not contribute its skill toward the resolution of the conflict while in a
                    bowed state.
                  </li>
                  <li>
                    If a participating character leaves play for any reason, it is no longer
                    participating in the conflict.
                  </li>
                  <li>
                    A character played directly into a conflict from a player's hand is
                    participating in the conflict. The controller of the character must indicate
                    that this is the case when the character is played.
                  </li>
                  <li>
                    If a character "cannot participate" in a conflict, that character cannot be
                    declared as an attacker or defender for, move into, be played into, or put into
                    play in that conflict. If an already participating character gains "cannot
                    participate" status during a conflict, move it home bowed.
                  </li>
                  <li>
                    In the enlightenment format, only two players can control participating
                    characters: one attacking player and one defending player. The third player in
                    the game may take actions to influence the outcome of the conflict, but they
                    cannot play or move characters to the conflict on either side (except as
                    indicated by card effects).
                  </li>
                  <li>
                    In the team conquest format, all four players can control participating
                    characters. Characters controlled by players on the same team participate on the
                    same side of the conflict and contribute their skill towards the same total.
                  </li>
                  <li>
                    If a conflict does not have two participating players, it cannot resolve.
                    Therefore, if a player is eliminated from the game in the middle of a conflict
                    and the game does not end, the conflict immediately ends with no winner. Return
                    the ring to the attacker’s unclaimed ring pool (or the common unclaimed ring
                    pool, as appropriate) and each participating character controlled by the
                    remaining player returns home bowed.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Pass" />
                <p>
                  There are times in the game at which a player has an option to perform an act
                  (such as taking an action, triggering an ability, or executing a game step), or to
                  pass. Passing in such a situation forfeits the player's right to perform that act
                  in that moment.
                </p>
                <ul>
                  <li>
                    The first player to pass the opportunity to use an action or play a card during
                    the dynasty phase forfeits the opportunity to do so for the remainder of the
                    phase, and gains one fate.
                  </li>
                  <li>
                    Other game sequences in which players have the option to pass continue until
                    both players pass consecutively. If the first player passes, and the second
                    player does not, the opportunity returns to the first player in the sequence.
                    The sequence only ends when both players have passed in succession. (In other
                    words, passing in such a sequence does not prevent a player from re-entering the
                    sequence should the opponent not also pass in succession.)
                  </li>
                  <li>
                    When passing an opportunity to declare a conflict, a player is not required to
                    specify which type of conflict he or she is passing.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Personal Honor, Personal Dishonor"
                />
                <p>
                  Personal honor is a means of tracking the honored or dishonored status of
                  individual character cards. Each character exists in one of three states:
                </p>
                <ul>
                  <li>Honored</li>
                  <li>Ordinary</li>
                  <li>Dishonored</li>
                </ul>
                <p>
                  Characters enter play with ordinary status. Honored status tokens and dishonored
                  status tokens are used to track the state of a character that receives a status
                  other than ordinary.
                </p>
                <ul>
                  <li>
                    When a character is honored, it receives an honored status token to indicate its
                    honored status. An honored character adds its glory value to both its military
                    and political skill so long as it possesses that token. When an honored
                    character leaves play its controller gains 1 honor.
                  </li>
                  <li>
                    When a character is dishonored, it receives a dishonored status token to
                    indicate its dishonored status. A dishonored character subtracts its glory value
                    from both its military and political skill so long as it possesses that token.
                    When a dishonored character leaves play its controller loses 1 honor.
                  </li>
                  <li>
                    When an honored character is dishonored, it loses its honored status, discards
                    the status token, and returns to ordinary status. Likewise, when a dishonored
                    character is honored, it loses its dishonored status, discards the status token,
                    and returns to ordinary status.
                  </li>
                  <li>
                    A character with an honored status token cannot become honored. A character with
                    a dishonored status token cannot become dishonored.
                  </li>
                  <li>
                    Should a character have both an honored status token and a dishonored status
                    token at the same time, discard both tokens. The character returns to the
                    ordinary state.
                  </li>
                  <li>
                    If a character enters play honored or dishonored, abilities cannot be triggered
                    from that character becoming honored or dishonored, as it enters play already
                    with that status.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Play and Put into Play" />
                <p>
                  <b>Play</b>ing a character or attachment card involves paying the card's fate cost
                  and placing the card in the play area. This causes the card to enter play. Cards
                  are played from a player's hand or provinces. Any time a character card is played,
                  its controller has the option of placing additional fate from his or her fate pool
                  on the card.
                </p>
                <p>
                  Some card abilities <b>put</b> cards <b>into play</b>. This bypasses the need to
                  pay the card's cost, as well as the opportunity to place additional fate on the
                  card. A card that is put into play bypasses any restrictions or prohibitions
                  regarding the potential of playing that card. A card that is put into play enters
                  play in its controller's play area.
                </p>
                <ul>
                  <li>
                    A card that has been put into play is not considered to have been "played."
                  </li>
                  <li>
                    In order to <em>play</em> a card, its fate cost (after modifiers) must be paid.
                  </li>
                  <li>
                    When a card is <em>put into play</em>, its fate cost is ignored.
                  </li>
                  <li>
                    Unless otherwise instructed by the put into play effect, characters that enter
                    play in this manner do so ready and at home. Non-character cards that enter play
                    in this manner must do so in a play area or state that matches the rules of
                    playing the card.
                  </li>
                  <li>
                    When an event card is played, place it on the table, resolve its ability, and
                    place the card in its owner's discard pile.
                  </li>
                  <li>
                    No card in a player’s conflict or dynasty deck can be played from that deck
                    unless by a card effect that specifically references playing the card from that
                    deck.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Play Restrictions and Permissions"
                />
                <p>
                  Many cards or abilities contain specific instructions pertaining to when or how
                  they may or may not be used, or to specific conditions that must be true in order
                  to use them. In order to use such an ability or to play such a card, all play
                  restrictions must be observed.
                </p>
                <p>
                  A permission is a variant of a play restriction that provides a player with
                  additional options as to how the card may be played or used, outside of the game's
                  general specification regarding how the card or ability would normally be used.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Player Elimination" />
                <p>
                  In most game formats, players are eliminated from the game when certain conditions
                  are met. Once a player is eliminated from the game, all cards that player owns are
                  immediately removed from the game, and their honor dial is ignored for the
                  purposes of card abilities for the rest of the game. If, after a player is
                  eliminated, only one player remains in the game, that player is the game’s winner.
                </p>
                <ul>
                  <li>
                    If a player is eliminated from an enlightenment format game, perform the
                    following steps:
                  </li>
                  <ul>
                    <li>
                      Any ring tokens an eliminated player had claimed on their provinces, or that
                      are in the eliminated player’s personal unclaimed ring pool, are placed in the
                      common unclaimed ring pool.
                    </li>
                    <li>
                      If the eliminated player was the first player, the first player token
                      immediately passes to the player on the eliminated player’s left.
                    </li>
                    <li>Any treaties made by the eliminated player are immediately dissolved.</li>
                  </ul>
                  <li>
                    Players are not eliminated from a team conquest format game until their entire
                    team loses. If a player’s stronghold province is broken, they continue to play,
                    with the following penalties:
                  </li>
                  <ul>
                    <li>
                      Treat the printed text box of that player’s stronghold as if it were blank
                      (except for Traits).
                    </li>
                    <li>That player cannot bid more than two during honor bids.</li>
                    <li>
                      That player cannot reshuffle either of their decks if those decks run out of
                      cards.
                    </li>
                    <li>
                      If a player reaches zero honor, their stronghold province is immediately
                      broken.
                    </li>
                    <li>Broken stronghold provinces are immune to all card effects.</li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Pride" />
                <p>
                  Pride is a keyword ability. After a character with the pride keyword wins a
                  conflict, honor that character. After a character with the pride keyword loses a
                  conflict, dishonor that character.
                </p>
                <ul>
                  <li>
                    The pride keyword resolves after the character wins or loses a conflict, before
                    reactions to that conflict being won or loss can be triggered.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Printed" />
                <p>
                  The word printed refers to the text, characteristic, icon, or value that is
                  physically printed on the card.
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Priority of Simultaneous Resolution"
                />
                <p>
                  If a single effect affects multiple players simultaneously, but the players must
                  individually make choices to resolve the effect, the first player chooses first,
                  followed by his or her opponent. Once all necessary choices have been made, the
                  effect resolves simultaneously upon all affected entities.
                </p>
                <ul>
                  <li>
                    If the resolution of two or more delayed effects or forced abilities would
                    resolve at the same time, the first player decides the order in which the
                    abilities resolve, regardless of who controls the cards bearing the conflicting
                    abilities.
                  </li>
                  <li>
                    If two or more constant abilities and/or lasting effects can be applied
                    simultaneously, they are. If two or more constant abilities and/or lasting
                    effects cannot be applied simultaneously, the first player determines the order
                    in which they are applied.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Provinces, Province Cards"
                />
                <p>
                  A player’s provinces represent the lands under their domain. When a province is
                  attacked and turned faceup, the card represents what the enemy finds or encounters
                  upon first entering that province.
                </p>
                <p>
                  When playing the skirmish format, province tokens are used instead of province
                  cards. These tokens have no game text, no element, and 3 defense strength. They
                  are never considered to be facedown or faceup, and are never revealed.
                </p>
                <ul>
                  <li>
                    A face-down province card is considered to be in play only as a face down
                    province, and its faceup side is unable to engage with the game state until the
                    province is revealed.
                  </li>
                  <li>
                    A non-broken, faceup province card is considered to be in play, and is engaged
                    with the game state.
                  </li>
                  <li>
                    A broken province is considered to have a blank text box, and its abilities
                    cannot be used.
                  </li>
                  <li>
                    If a province has more than one card in it, those cards are considered to all be
                    in the same province. Characters and events can be played and holdings provide
                    their bonuses. Do not refill a province until it is empty.
                  </li>
                  <li>
                    Each player’s non-stronghold provinces are placed in a linear row in front of
                    that player. Each of those provinces is adjacent to the province immediately to
                    its left and right. A player’s stronghold province is not adjacent to any other
                    province.
                  </li>
                  <li>
                    Each province card has one or more elements associated with it. A province with
                    more than one element counts as a province of each of its elements at all times
                    and can be selected during deck construction to fulfill the province slot of any
                    of those elements.
                  </li>
                  <li>
                    A fivefold <i>tomoe</i> symbol used in place of a single element, such as on
                    Toshi Ranbo (Inheritance Cycle, 1), indicates that all five elements are
                    associated with that province.
                  </li>
                  <li>
                    During a conflict, a province is only considered to be an “eligible” province to
                    be attacked if it is controlled by the defending player. The provinces of any
                    non-defending players are not eligible to be attacked. A player cannot attack
                    their own province.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Qualifiers" />
                <p>
                  If card text includes a qualifier followed by multiple terms, the qualifier
                  applies to each item in the list, if it is applicable. For example, in the phrase
                  "each unique character and attachment," the word "unique" applies both to
                  "character" and to "attachment."
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Rally" />
                <p>
                  Rally is a keyword ability that appears on dynasty cards. When a card with the
                  rally keyword is revealed in a player’s provinces, that player fills the same
                  province faceup. Both cards are in the province together, and either can be played
                  as an action during the dynasty phase. Do not refill a province until it is empty.
                </p>
                <ul>
                  <li>
                    When a province is filled or refilled faceup, or when a card is added to a
                    province faceup, that card is not revealed and the rally keyword on it does not
                    trigger.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Reactions" />
                <p>
                  A reaction is a triggered ability whose text is prefaced by a boldface "
                  <b>Reaction:</b>" precursor. Always resolve a triggering condition before
                  initiating any reactions to that triggering condition.
                </p>
                <p>
                  Unlike actions, which are resolved during action windows, a reaction may be
                  initiated only if its specified triggering condition occurs, as described in the
                  reaction ability's text.
                </p>
                <p>
                  After a triggering condition resolves, a reaction window for that triggering
                  condition opens.
                </p>
                <p>
                  Within the reaction window, the first player always has the first opportunity to
                  initiate an eligible reaction (to the triggering condition that opened the
                  window), or pass. Opportunities to initiate an eligible reaction, or pass,
                  continue to alternate between the players until all players consecutively pass, at
                  which point the reaction window closes. Passing does not prevent a player from
                  initiating an eligible reaction later in that same reaction window.
                </p>
                <p>
                  Once a reaction window closes, further reactions to that specific triggering
                  condition cannot be initiated.
                </p>
                <ul>
                  <li>
                    Unless otherwise noted by the ability, each reaction ability may be initiated
                    once each round. (This includes forced reactions.)
                  </li>
                  <li>
                    A reaction with a specified limit that enables it to be triggered more than once
                    per round may only be initiated once each time its specified triggering
                    condition occurs.
                  </li>
                </ul>
                <ul>
                  <li>
                    If multiple players can trigger a reaction ability, each may do so to the same
                    triggering condition.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Ready" />
                <p>
                  A card that is in an upright state so that its controller can read its text from
                  left to right is considered ready.
                </p>
                <ul>
                  <li>The default state in which cards enter play is ready.</li>
                  <li>A ready card is bowed by rotating it 90 degrees to the side.</li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Refill a Province" />
                <p>
                  If a player is instructed to refill a province, that player takes the top card of
                  his or her dynasty deck and places it facedown (without looking at it) on the
                  province.
                </p>
                <ul>
                  <li>
                    After a card is removed from a province for any reason (and after all reaction
                    opportunities to that card leaving the province are passed), a player
                    automatically refills the province from which the card was removed if that
                    province is still empty (i.e., if there is no dynasty card there).
                  </li>
                  <li>
                    If a player is instructed to refill a province faceup, the dynasty card is
                    placed in the province faceup rather than facedown.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Removed from Game" />
                <p>
                  "Removed from the game" is an out-of-play state. A card that has been removed from
                  the game is set aside and has no further interaction with the game in any manner
                  for the duration of its removal. If there is no specified duration, a card that
                  has been removed from the game is considered removed until the end of the game.
                </p>
                <ul>
                  <li>
                    Cards that have been removed from the game are faceup, open information that is
                    available to both players, unless otherwise specified.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Replacement Effects" />
                <p>
                  A replacement effect is an effect (usually an interrupt) that replaces the
                  resolution of a triggering condition with a different means of resolving the same
                  triggering condition, but in such a manner that the triggering condition is still
                  considered to occur for the purposes of paying non-sacrifice costs. The word
                  "instead" is frequently indicative of such an effect. After all interrupts to the
                  triggering condition have resolved and it is time to resolve the triggering
                  condition itself, the replacement effect resolves instead.
                </p>
                <ul>
                  <li>
                    If multiple replacement effects are initiated against the same triggering
                    condition, the most recently initiated replacement effect is the one used for
                    the resolution of the triggering condition.
                  </li>
                  <li>
                    If the new resolution of a triggering condition caused by a replacement effect
                    would not change the game state, that replacement effect cannot be initiated.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#would">Would</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Resolve an Ability" />
                <p>
                  Some abilities instruct a player to “resolve an ability" or “resolve this ability
                  twice." To resolve a triggered ability, resolve all text after the bold timing
                  word (action, reaction, or interrupt), paying all ability costs, choosing any
                  relevant targets, and resolving the ability’s effect.
                </p>
                <ul>
                  <li>
                    When resolving a card’s ability, that card is not being played, and its fate
                    cost (or other costs associated with playing the card) are not paid.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#initiating-abilities-playing-cards">
                    Initiating Abilities / Playing Cards
                  </a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Restore a Province" />
                <p>
                  If a player is instructed to restore a broken province, that province is rotated
                  180 degrees and its ability text becomes active as the province is no longer
                  considered to be broken. It is not turned facedown.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Restricted" />
                <p>
                  Restricted is a keyword ability. A character may not have more than two
                  attachments with the restricted keyword attached to it at any time.
                </p>
                <ul>
                  <li>
                    If at any time a character has three or more restricted attachments, that
                    character's controller must immediately choose and discard one of the restricted
                    attachments on the character as soon as the illegal game state occurs.
                  </li>
                  <li>
                    A player may choose to play a third restricted attachment onto a character, but
                    that character's controller must immediately choose and discard one of its
                    restricted attachments when the new attachment enters play.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Reveal" />
                <p>
                  When a player is instructed to reveal cards, that player is required to show those
                  cards to his or her opponent to that opponent's satisfaction. If there is no
                  specified duration for the reveal, the cards remain revealed until they reach a
                  new destination (as specified by the ability), or through the ability's
                  resolution.
                </p>
                <ul>
                  <li>
                    While a card is revealed, it is still considered to be located in the game area
                    (such as a player's hand or deck) from which it is revealed.
                  </li>
                  <li>
                    When a province card is revealed by a card effect, it remains faceup until a
                    card or game effect turns it facedown.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Rings" />
                <p>
                  Rings, represented by double-sided tokens, are used to determine the type and
                  element of conflicts. Each ring exists in one or more of three states, as follows:
                </p>
                <p>
                  <b>Unclaimed</b> &ndash; Each ring in the unclaimed ring pool is an unclaimed
                  ring, and is eligible to be selected by a player as a part of the process of
                  declaring a conflict.
                </p>
                <p>
                  <b>Contested</b> &ndash; While a conflict is resolving, the ring that has been
                  selected by the attacker when the conflict was declared is placed on the attacked
                  province. This ring is known as the contested ring.
                </p>
                <p>
                  <b>Claimed</b> &ndash; Each ring in a player's claimed ring pool is a claimed
                  ring.
                </p>
                <ul>
                  <li>
                    While performing a glory count, each player adds 1 to his or her total for each
                    ring in his or her claimed ring pool.
                  </li>
                  <li>During the fate phase, place 1 fate on each unclaimed ring.</li>
                  <ul>
                    <li>This step is skipped when playing the skirmish format.</li>
                  </ul>
                  <li>
                    When a ring becomes the contested ring in a conflict, move all fate on that ring
                    to the attacking player's fate pool.
                  </li>
                  <li>
                    When a ring is claimed, it is still considered to be contested until all
                    reactions to its claiming have resolved.
                  </li>
                  <li>
                    A card effect that refers to “the [ELEMENT] ring" refers to any ring that has
                    that element.
                  </li>
                  <li>
                    When a player claims a ring in the enlightenment format, that ring is placed on
                    one of that player’s provinces. The ring is considered to be “claimed on that
                    province.” Rings claimed on a player’s provinces do not return to the unclaimed
                    ring pool during the fate phase. They are still considered to be in that
                    player’s claimed ring pool.
                  </li>
                  <ul>
                    <li>
                      A player cannot have multiple rings of the same printed element claimed on
                      their provinces. If they would do so, the duplicate ring is not claimed and is
                      instead returned to the attacking player’s unclaimed ring pool (if contested)
                      or to the defending player’s unclaimed ring pool (if claimed on a broken
                      province).
                    </li>
                    <li>
                      A player cannot claim a ring on their stronghold province unless their
                      stronghold province is eligible to be attacked by their opponents.
                    </li>
                    <li>
                      If a player breaks an opponent’s province during a conflict, they claim each
                      ring that was claimed on that province, distributing those rings among their
                      own provinces if able.
                    </li>
                    <li>
                      When a card effect would cause a ring to move from a player’s claimed ring
                      pool to an unclaimed ring pool or vice-versa, both pools must belong to the
                      same player. During a conflict, card effects can only switch the contested
                      ring with rings in the claimed or unclaimed ring pools of the attacking
                      player.
                    </li>
                  </ul>
                  <li>
                    In the team conquest format, each team has a shared claimed ring pool. For the
                    purposes of card and game effects, a team’s claimed ring pool counts as the
                    claimed ring pool of each player on that team.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#ring-effects">Ring Effects</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Ring Effects" />
                <p>
                  Each time a player wins a conflict as the attacking player, he or she may resolve
                  the ring effect associated with the contested ring's element. The ring effects are
                  as follows:
                </p>
                <p>
                  <b>Air</b>: Either take 1 honor from your opponent, or gain 2 honor from the
                  general token pool.
                </p>
                <p>
                  <b>Earth</b>: Draw 1 card from your conflict deck and discard 1 random card from
                  your opponent's hand.
                </p>
                <p>
                  <b>Fire</b>: Choose a character in play and either honor or dishonor that
                  character.
                </p>
                <p>
                  <b>Water</b>: Either choose a character and ready it, or choose a character with
                  no fate on it and bow it.
                </p>
                <p>
                  <b>Void</b>: Choose a character and remove 1 fate from it.
                </p>
                <ul>
                  <li>
                    Whenever a player resolves a ring effect for a ring that has multiple elements,
                    that player may choose among those elements when the conflict's ring effect
                    resolves.
                  </li>
                  <li>
                    When a player is instructed to resolve multiple ring effects, they resolve each
                    effect (or pass on that effect) in its entirety before resolving the next ring
                    effect.
                  </li>
                  <li>
                    When playing the skirmish format, the following three rings have the following
                    effects instead:
                  </li>
                  <ul>
                    <li>
                      <b>Air</b>: Take 1 honor from your opponent.
                    </li>
                    <li>
                      <b>Earth</b>: Either draw 1 card from your conflict deck or discard 1 random
                      card from your opponent’s hand.
                    </li>
                    <li>
                      <b>Water</b>: Choose a character in any player’s home area with 1 or fewer
                      fate on it and either ready or bow it.
                    </li>
                  </ul>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Role Cards" />
                <p>
                  A role card is placed alongside a player's stronghold, and provides specialized
                  abilities and limitations for that player's deck. A player may use a single role
                  card in conjunction with his or her stronghold while assembling a deck. The role
                  card starts the game next to its owner's stronghold and is revealed along with the
                  stronghold during setup.
                </p>
                <p>Role cards are not used in the skirmish format.</p>
                <ul>
                  <li>
                    Role cards are not considered in play. Their text affects the game state from
                    the out-of-play area while they are active beside a player's stronghold.
                  </li>
                  <li>
                    Cards that are printed as the role card type cannot be removed from the game by
                    other card abilities.
                  </li>
                  <li>
                    Some cards have the text, "___ role only." This is a deckbuilding restriction,
                    and is not active during gameplay.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Running Out of Cards" />
                <p>
                  If a player attempts to fill or refill one of their provinces or to draw a card
                  from their conflict deck and no cards remain in the deck, that player loses 5
                  honor, then shuffles the corresponding discard pile and places it facedown to form
                  a new dynasty or conflict deck. That player then continues to (re)fill the
                  province or draw the conflict card.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Sacrifice" />
                <p>
                  When a player is instructed to sacrifice a card, that player must select a card in
                  play that he or she controls and that matches the requirements of the sacrifice,
                  and place it in his or her discard pile.
                </p>
                <ul>
                  <li>
                    If the selected card does not leave play, the sacrifice is considered to have
                    been prevented.
                  </li>
                  <li>
                    Sacrificing a card does not satisfy other means (such as "discard") of a card
                    leaving play.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Search" />
                <p>
                  When a player is instructed to search for a card, that player is permitted to look
                  at all of the cards in the searched area without revealing those cards to his or
                  her opponent.
                </p>
                <ul>
                  <li>
                    If an effect searches an entire deck, the deck must be shuffled to the
                    satisfaction of the opponent upon completion of the search.
                  </li>
                  <li>
                    A player is not obliged to find the object of a search effect, even if the
                    searched cards contain a card that meets the eligibility requirements of the
                    search.
                  </li>
                  <li>
                    If a search effect would add a card with specified characteristics to a hidden
                    game area, the player fulfilling the search must reveal the card to his or her
                    opponent to verify that the card is eligible to be found by the search.
                  </li>
                  <li>
                    While a game area (or a part of a game area) is being searched, the cards being
                    searched are considered to still be in that game area.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Select" />
                <p>Some abilities instruct a player to select among multiple options.</p>
                <ul>
                  <li>
                    If a selection is required before the effect of the ability resolves (i.e.,
                    before the dash), the selection is made during the same timing step in which
                    targets are chosen.
                  </li>
                  <li>
                    If a selection is indicated after the dash of an ability's text, that selection
                    is made during the resolution of the effect.
                  </li>
                  <li>
                    Unless otherwise indicated by the ability, the controller of the ability is the
                    player who makes the selection.
                  </li>
                  <li>
                    For all selections, an option that has the potential to change the game state
                    must be chosen, if able.
                  </li>
                </ul>
                <p>
                  <b>Related:</b>{' '}
                  <a href="#initiating-abilities-playing-cards">Initiating Abilities</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Self-referential Text" />
                <p>
                  When a card's ability text refers to itself ("this character," "this province,"
                  etc.), the text is referring to that copy only, and not to other copies (by title)
                  of the card.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Set" />
                <p>
                  See "<a href="#modifiers">Modifiers</a>".
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Setup" />
                <p>To set up a game, perform the following steps in order:</p>
                <ol>
                  <li>
                    <b>Select decks</b>. Each player selects a deck using the deckbuilding rules.
                    See "<a href="#deckbuilding">Deckbuilding</a>".
                  </li>
                  <li>
                    <b>Create token bank and unclaimed ring pool</b>. Place all fate tokens, honor
                    tokens, status tokens, and the Imperial Favor in a pile within reach of each
                    player. This area is known as the token bank. Place the rings near the token
                    bank. This area is known as the unclaimed ring pool.
                  </li>
                  <ul>
                    <li>
                      In the enlightenment format, instead of placing five rings in a single
                      unclaimed ring pool, each player places five ring tokens (one of each element)
                      in their own personal unclaimed ring pool.
                    </li>
                  </ul>
                  <li>
                    <b>Determine first player</b>. Randomly select a player. That player will be the
                    first player. Place the first player token in front of this player.
                  </li>
                  <li>
                    <b>Shuffle dynasty and conflict decks</b>. Each player shuffles both their
                    dynasty and conflict decks separately and presents them to the opponent for
                    additional shuffling and/or a final cut. Then each player places their dynasty
                    deck to the left of their play area and their conflict deck to the right.
                  </li>
                  <li>
                    <b>Place provinces and stronghold</b>. In player order, each player secretly
                    selects one of their province cards, places it facedown above their dynasty
                    deck, and places their stronghold card on top of it. If a player is using a role
                    card, it is placed next to his or her stronghold during this step. Each player
                    then places their other four provinces facedown between their dynasty and
                    conflict decks, in any order.
                  </li>
                  <ul>
                    <li>
                      In the skirmish format, each player instead places three province tokens
                      between their dynasty and conflict decks.
                    </li>
                  </ul>
                  <li>
                    <b>Fill provinces</b>. Each player places a card from the top of their dynasty
                    deck facedown onto each of their empty non-stronghold provinces. In player
                    order, each player looks at each of his or her cards placed in this manner and
                    has one opportunity to mulligan any number of them.
                  </li>
                  <ul>
                    <li>
                      <b>Note:</b> After this step, a player may not look at facedown cards in his
                      or her provinces.
                    </li>
                  </ul>
                  <li>
                    <b>Draw starting hand</b>. Each player draws 4 cards from their conflict deck.
                    In player order, each player has one opportunity to mulligan any number of these
                    cards.
                  </li>
                  <ul>
                    <li>
                      In the skirmish format, each player draws and mulligans to 3 cards instead of
                      4.
                    </li>
                  </ul>
                  <li>
                    <b>Gain starting honor</b>. Each player gains honor tokens equal to the honor
                    value on their stronghold.
                  </li>
                  <ul>
                    <li>In the skirmish format, each player starts the game with 6 honor.</li>
                  </ul>
                </ol>
                <p>The game is now ready to begin.</p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Shadowlands" />
                <p>
                  The Shadowlands is a special faction that functions in cooperative and challenge
                  play. It cannot be used in standard play and has a unique set of rules documented
                  in the Under Fu Leng's Shadow rulebook, which can be found on www.L5R.com.
                </p>
                <p>
                  The Shadowlands faction is indicated by the following clan icon in text (
                  <span className="icon icon-clan-shadowlands" />
                  ).
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Shuffle" />
                <p>
                  The word "shuffle" is used as a shorthand that instructs a player to shuffle a
                  deck that was just searched. When a player is instructed to shuffle, only shuffle
                  the deck or decks that were affected by the ability.
                </p>
                <ul>
                  <li>
                    Each time a deck is shuffled, it must be randomized to the satisfaction of the
                    opponent, and upon completion of the shuffle presented to the opponent for
                    additional shuffling and/or a final cut.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Sincerity" />
                <p>
                  Sincerity is a keyword ability. When a card with the sincerity keyword leaves
                  play, its controller draws 1 card.
                </p>
                <ul>
                  <li>
                    The sincerity keyword resolves after the card leaves play, before reactions to
                    that card leaving play can be triggered.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Skill" />
                <p>
                  A character's effectiveness in various endeavors is measured by its skill. There
                  are two types of skill in the game, military skill and political skill.
                </p>
                <p>
                  Military skill (<span className="icon icon-conflict-military" />) is used to
                  determine the victor during military conflicts.
                </p>
                <p>
                  Political skill (<span className="icon icon-conflict-political" />) is used to
                  determine the victor during political conflicts.
                </p>
                <ul>
                  <li>
                    Total attacking skill is the sum of each ready participating character's skill
                    (for the appropriate conflict type) on the attacking player's side, plus any
                    relevant modifiers.
                  </li>
                  <li>
                    Total defending skill is the sum of each ready participating character's skill
                    (for the appropriate conflict type) on the defending player's side, plus any
                    relevant modifiers.
                  </li>
                  <li>
                    A player is not able to win a conflict if that player has a total attacking or
                    defending skill of zero.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Status Token" />
                <p>
                  A status token can be placed on a card to alter its status during a game. These
                  include honored status tokens, dishonored status tokens and tainted status tokens.
                  Each kind of status token has a different effect on the card it is placed on.
                </p>
                <li>
                  Honored status tokens are used to indicate a character’s honored status. A
                  character with an honored status token adds its glory to each of its skills. That
                  character’s controller gains 1 honor when that character leaves play.
                </li>
                <li>
                  Dishonored status tokens are used to indicate a character’s dishonored status. A
                  character with a dishonored status token subtracts its glory from each of its
                  skills. That character’s controller loses 1 honor when that character leaves play,
                </li>
                <li>
                  Tainted status tokens are used to indicate that a character or province has been
                  tainted by the Shadowlands. A character with a tainted status token gets +2
                  <span className="icon icon-conflict-military" /> and +2
                  <span className="icon icon-conflict-political" />, but its controller must lose 1
                  honor when it is declared as an attacker or defender in a conflict. A province
                  with a tainted status token gets +2 strength, but its controller must lose 1 honor
                  when they declare 1 or more defenders during conflicts at that province.
                </li>
                <li>
                  Dishonored status tokens can be placed on provinces by card abilities. A province
                  with a dishonored status token is treated as if its printed text box were blank
                  (except for Traits) while the token is on that province.
                </li>
                <li>
                  A status token cannot be removed from a card unless it is a character whose
                  personal honor is changed (see Personal Honor, Personal Dishonor on page 15) or a
                  card effect specifically moves or removes that status token.
                </li>
                <li>
                  If a card effect “moves” or “discards” an honored or dishonored status token from
                  a character, that character has not been honored or dishonored for the purposes of
                  card abilities, even though it loses its honored/dishonored status.
                </li>
                <p>
                  See <a href="#personal-honor-personal-dishonor">Personal Honor</a>.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Stronghold" />
                <p>
                  A player's stronghold is considered in play. A stronghold card cannot leave play,
                  move from the stronghold province, be turned facedown, or change control.
                </p>
                <p>Stronghold cards are not used in the skirmish format.</p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Support" />
                <p>
                  The support keyword introduced in the <i>Clan War</i> expansion allows multiple
                  players to pay the fate cost of a card together. When a player plays a card with
                  the support keyword, another player may choose to help pay the card’s fate cost.
                </p>
                <ul>
                  <li>
                    When a player is playing a card with the support keyword, they may solicit the
                    other players in the game to see if any player wishes to contribute to paying
                    the card’s fate cost. Alternatively, another player may offer to contribute
                    fate.
                  </li>
                  <li>
                    The player who helps pay the cost of a card with the support keyword is
                    considered to be supporting the player who is playing the card.
                  </li>
                  <li>
                    No other player is ever obligated to pay for a card with the support keyword.
                    The player playing a card with the support keyword is never obligated to accept
                    fate from another player who wishes to support them.
                  </li>
                  <li>
                    If a player attempts to play a card with the support keyword that they cannot
                    fully pay for and no other player supports them to help pay for the card, it
                    remains unplayed in that player’s hand. They pay none of the card’s costs.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Switch" />
                <p>
                  Some abilities use the word "switch." In order to use such an ability, switched
                  items must exist on each side of the switch.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Take" />
                <p>
                  If a player is instructed to take a token (such as honor or fate) from another
                  player, that element is removed from the other player's token pool and added to
                  the taking player's token pool.
                </p>
                <ul>
                  The player taking the tokens is considered to be gaining the tokens and the other
                  player is considered to be losing the tokens.
                </ul>
                <p>
                  <b>Related:</b> <a href="#gains">Gains</a>,<a href="#give">Give</a>,{' '}
                  <a href="#loses">Loses</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Tainted, Tainted Status Token"
                />
                <p>
                  The tainted status token allows characters and provinces to become tainted by the
                  corrupting presence of Jigoku.
                </p>
                <p>
                  When a card ability or ring effect would taint a character, place a tainted status
                  token on it. A tainted character cannot be tainted again.
                </p>
                <p>
                  Each character that is tainted gets +2
                  <span className="icon icon-conflict-military" /> and +2
                  <span className="icon icon-conflict-political" />. As an additional cost to
                  declare a tainted character as an attacker or defender in a conflict, its
                  controller must lose 1 honor.
                </p>
                <p>
                  Each province that is tainted gets +2 strength. As an additional cost to declare
                  any number of defenders in a conflict against a tainted province, its controller
                  must lose 1 honor.
                </p>
                <p>
                  Once a card is tainted, that tainted status cannot be removed unless a card
                  ability discards (or moves) its status token. If a tainted province is turned
                  faceup or facedown, do not discard its tainted status token.
                </p>
                <p>
                  A character’s tainted status has no bearing on its personal honor, and a tainted
                  character can be honored or dishonored the same as an untainted character.
                </p>
                <p>
                  <b>Related:</b> <a href="#corrupted">Corrupted</a>,{' '}
                  <a href="#status-token">Status Token</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Target" />
                <p>
                  The word "choose" indicates that one or more targets must be chosen in order for
                  an ability to resolve. The player resolving the effect must choose a game element
                  (usually a card) that meets the targeting requirements of the ability.
                </p>
                <ul>
                  <li>
                    The controller of a targeting ability chooses all targets for the effect unless
                    otherwise specified by the card.
                  </li>
                  <li>
                    If an ability requires the choosing of one or more targets, and there are not
                    enough valid targets to meet all of its targeting requirements, the ability
                    cannot be initiated. This initiation check is made at the same time the
                    ability's play restrictions are checked.
                  </li>
                  <li>
                    At the time targets are chosen, any currently valid targets are eligible to be
                    chosen. (This choice is not restricted only to targets that were present during
                    the initiation check.)
                  </li>
                  <li>
                    If multiple targets are required to be chosen by the same player, these are
                    chosen simultaneously.
                  </li>
                  <li>
                    Most card abilities that initiate a duel (see
                    <a href="#duel-timing">Duel Timing</a>) use the phrase “initiate a [type] duel."
                    The characters chosen during duel initiation are considered to be chosen as
                    targets of the ability that initiates the duel.
                  </li>
                  <li>
                    An ability that can choose “any number" of targets, or “up to X" targets, can
                    successfully resolve if zero such targets are chosen, unless choosing zero such
                    targets would cause the resolution of the ability’s effect to not change the
                    game state in any way.
                  </li>
                  <li>
                    Some abilities require the choice of a target that is not directly affected by
                    the ability — the target is instead chosen as a reference point for the
                    resolution of the ability. This is referred to as a “referential target."
                  </li>
                  <li>
                    A card is not an eligible target for an ability if the resolution of that
                    ability's effect could not affect the target at all, unless it is a referential
                    target.
                    <em>
                      (For example, a bowed character cannot be chosen as the target for an ability
                      that reads "<b>Action:</b> Choose a character &ndash; bow that character.")
                    </em>
                  </li>
                  <li>
                    A card is only eligible to be chosen as a referential target for an ability if
                    that ability’s effect (using the referential target) would result in a change of
                    game state.
                    <em>
                      (For example, a character with no attachments cannot be chosen as the target
                      for an ability that reads “<b>Action:</b> Choose a character — discard each
                      attachment on that character.")
                    </em>
                  </li>
                  <li>
                    The resolution of some effects (such as post-then effects, or delayed effects)
                    requires that targets are chosen after the initiation of the effect. Such
                    targets need not be verified when checking play restrictions and determining
                    whether or not the entire ability may initiate. If there are no valid targets at
                    the time such targets would be chosen, that aspect of the effect fails to
                    resolve.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text='The word "To"' />
                <p>
                  If the effect text of a card ability includes the word "to," then the text that
                  follows the word “to" can only be resolved if the preceding text was successfully
                  resolved in full.
                </p>
                <ul>
                  <li>
                    If the pre-to aspect of an effect successfully resolves in full, the post-to
                    aspect of that effect resolves simultaneously with all other effects of that
                    card ability.
                  </li>
                  <li>
                    If the pre-to aspect of an effect does not successfully resolve in full, the
                    post-to aspect’s resolution is canceled.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Token Pool, General Token Pool"
                />
                <p>
                  The token pool (also referred to as the general token pool) is created during
                  setup and contains all of the tokens and counters not currently controlled by any
                  player.
                </p>
                <ul>
                  <li>
                    When a player gains fate or honor, that fate or honor is taken from the token
                    pool and added to that player's fate or honor pool. When a player spends or
                    loses fate or honor, those tokens are returned to the token pool.
                  </li>
                  <li>
                    When a card with any tokens or counters on it leaves play, those tokens and
                    counters are returned to the token pool.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Tokens, Running Out of" />
                <p>
                  There is no limit to the number of fate, honor, and personal status tokens which
                  can be in the game area at a given time. If players run out of the provided
                  tokens, other tokens, counters, or coins may be used to track the game state.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Traits" />
                <p>
                  Most cards have one or more traits listed at the top of the text box and printed
                  in <em>Bold Italics</em>.
                </p>
                <ul>
                  <li>
                    <em>Traits</em> have no inherent effect on the game. Instead, some card
                    abilities reference cards that possess specific traits.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Treaties" />
                <p>
                  During the course of an enlightenment format game, players may find themselves in
                  situations where a mutually beneficial agreement called a treaty can be made. In
                  addition to setting up the terms of the treaty, both players agree on value to
                  stake on the treaty (by default, an amount of honor). If either player breaks
                  their part of a treaty, that player must suffer consequences based on the value
                  staked on the treaty.
                </p>
                <p>
                  When two players are setting up a treaty, each of the following parameters must be
                  specified. Those players may discuss and determine these parameters in any order,
                  but each parameter must be agreed upon by both involved players before a treaty
                  can be finalized. The parameters are as follows:
                </p>
                <p>
                  <b>What is Being Promised by Each Player:</b> When making a promise for a treaty,
                  a player offers something they are going to do, or not do, during the course of
                  the game. This promise must be an action or a decision that a player can take and
                  cannot include an exchange of game components (honor, fate, cards, or claimed
                  rings).
                </p>
                <p>
                  <b>Duration:</b> When a treaty is established, both involved players must agree to
                  a duration for how long the treaty is going to last. This duration can be of any
                  length, from “immediate” to “the remainder of the game.” Once a treaty’s duration
                  has ended it either is dissolved (if both players have kept their promises), or it
                  is broken (if one player did not do what they promised in the specified
                  timeframe), causing the player that broke the treaty to suffer the consequences.
                </p>
                <p>
                  <b>Value:</b> Both involved players must agree upon value to stake on the treaty
                  (between 1 and 5). If during the course of play, the treaty between the two
                  players is broken by either player, the player that broke the treaty suffers a
                  penalty based on the value staked on the treaty. By default, this comes in the
                  form of losing that amount of honor, though it may be defined by a treaty card.
                </p>
                <ul>
                  <li>
                    After a treaty has been broken, the players are no longer bound by the promises
                    they made when establishing the treaty.
                  </li>
                  <li>
                    Each player can form a treaty with any number of other players, but each pair of
                    players may only have one treaty active between them at any given time. If a
                    treaty between two players has dissolved, or been broken, a new treaty may be
                    formed between those players.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Treaty Cards" />
                <p>
                  Treaty cards are included in the Clan War expansion and can be used to increase
                  variety when playing the enlightenment format. To use these cards, shuffle them
                  into a treaty deck at the start of the game and set it within reach of all
                  players. These replace the default method of staking honor on treaties.
                </p>
                <p>
                  Whenever two players agree on a treaty, they place the top card of the treaty deck
                  facedown between them without looking at it and mark the value staked on the
                  treaty. When a player breaks that treaty, they reveal the card and resolve its
                  text. Note that any treaty card that refers to “the player who did not break this
                  treaty” refers only to the single other player with whom the treaty was made.
                </p>
                <p>
                  After a treaty is broken (and its effects resolved) or fulfilled (and its effects
                  unrevealed), put that treaty card on the bottom of the the treaty deck.
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Triggered Abilities" />
                <p>
                  A boldface timing command followed by a colon indicates that an ability is a
                  triggered ability. Triggered abilities fall into one of the following types:
                  actions, interrupts, and reactions. Some interrupt and reaction abilities are also
                  forced.
                </p>
                <ul>
                  <li>
                    Unless the timing command is prefaced by the word "Forced," all triggered
                    abilities are optional. They can be triggered (or not) by their controller at
                    the ability's appropriate timing point. Forced triggered abilities are triggered
                    automatically by the game at the ability's appropriate timing point.
                    <ul>
                      <li>
                        Any targets that must be chosen in the resolution of a card’s “Forced”
                        ability are chosen by the controller of that card.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Unless otherwise specified by the ability itself, each triggered ability may be
                    triggered once per round. This limit is player specific.
                  </li>
                  <li>
                    Triggered abilities are written in a
                    <i>
                      "triggering condition (and/or) cost (and/or) targeting requirements &ndash;
                      effect"
                    </i>
                    template. Ability text before the dash consists of triggering conditions
                    (and/or) costs (and/or) targeting requirements. Ability text after the dash
                    consists of effects. and may sometimes include targeting requirements that come
                    into play as the effect is being resolved.
                  </li>
                  <li>
                    If a triggered ability has no dash, the ability has no pre-dash content, and the
                    entirety of the ability is considered an effect.
                  </li>
                  <li>
                    A triggered ability can only be initiated if its <i>effect</i> has the potential
                    to change the game state on its own. This potential is assessed without taking
                    into account the consequences of the cost payment or the consequences of any
                    other ability interactions.
                  </li>
                  <li>
                    A triggered ability can only be initiated if its cost (after modifiers) has the
                    potential to be paid in full.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#ability">Ability</a>,<a href="#action">Action</a>,{' '}
                  <a href="#cost">Cost</a>,<a href="#effect">Effect</a>,{' '}
                  <a href="#interrupts">Interrupts</a>,
                  <a href="#limits-of-triggered-abilities">Limits of Triggered Abilities</a>,{' '}
                  <a href="#reactions">Reactions</a>,<a href="#target">Target</a>
                </p>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Triggering Condition" />
                <p>
                  A triggering condition is a condition which dictates when an ability can be
                  triggered. On card abilities, the triggering condition is the element of the
                  ability that references such a condition, which most often comes in the form of a
                  specific occurrence that takes place during the game. This indicates the timing
                  point at which the ability may be used. The description of an ability's triggering
                  condition often follows the word "when" (for interrupt abilities) or the word
                  "after" (for reaction abilities), or the word "if" (for action abilities.
                </p>
                <p>
                  If a single occurrence creates multiple triggering conditions for reactions or
                  interrupts (such as a single Earth ring effect causing a player to draw a card and
                  another player to discard a card), those triggering conditions are handled in
                  shared interrupt/reaction windows, in which abilities that refer to any of the
                  triggering conditions created by that occurrence may be used in any order.
                </p>
                <p>
                  The following is a sequence of possible interrupt and reaction opportunities that
                  exists around each triggering condition that may arise in a game:
                </p>
                <ol>
                  <li>
                    The triggering condition becomes imminent. (Meaning that if it is not canceled,
                    changed, or otherwise preempted by interrupt abilities, the triggering condition
                    is the next thing that will occur in the game.)
                  </li>
                  <li>
                    Interrupt abilities that reference when the imminent triggering condition
                    "would" occur may be used. (<b>Note</b>: For effects, a "cancel" interrupt may
                    prevent the effect from initiating, and the initiation of the effect is a
                    separate triggering condition that precedes the effect's resolution. "Cancel"
                    interrupts are the only type that will reference the initiation of an effect.)
                    If the imminent triggering condition is canceled, none of the subsequent steps
                    in this sequence occur. If the triggering condition is changed, the original
                    condition is no longer imminent, but the new triggering condition is now
                    imminent.
                  </li>
                  <li>
                    Forced interrupts that reference the imminent triggering condition must resolve,
                    in the order determined by the first player. The standard interrupt window to
                    the imminent triggering condition opens. It closes after all players
                    consecutively pass.
                  </li>
                  <li>The triggering condition itself occurs.</li>
                  <li>
                    Forced reactions that reference the triggering condition must resolve, in the
                    order determined by the first player.
                  </li>
                  <li>
                    The reaction window to the triggering condition opens. It closes after all
                    players consecutively pass.
                  </li>
                </ol>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Unique Cards" />
                <p>
                  A card with the <span className="icon icon-unique" /> symbol in front of its title
                  is a unique card. Each player may only have a maximum of one instance of each
                  unique card, by title, in play.
                </p>
                <ul>
                  <li>
                    A player cannot take control of or bring into play a unique card if he or she
                    already controls or owns another in-play card with the same title or printed
                    title.
                  </li>
                  <li>
                    A player cannot bring into play a unique card owned by his or her opponent if
                    that opponent controls an in-play card with the same title or printed title.
                  </li>
                  <li>
                    As a player action during the dynasty phase, a player may discard a copy (by
                    title) of a unique character from his or her hand or provinces to place 1 fate
                    on an in-play copy of that unique character he or she controls.
                  </li>
                  <li>
                    In team games, the rules listed above apply to a team instead of a player
                    (players on the same team may only have a maximum of one instance of each unique
                    card, by title, in play at any time).
                  </li>
                  <li>
                    While two or more players on a team control more than one copy of a unique
                    stronghold, province card, or holding, treat each copy of that card as if its
                    printed text box were blank and as if it had a strength or bonus strength of 0.
                  </li>
                </ul>
                <p>
                  <b>Related:</b> <a href="#duplicates">Duplicates</a>
                </p>
              </article>
              <article>
                <AnchoredHeading
                  addHeading={addHeading}
                  level="2"
                  text="Unopposed, Unopposed Conflict"
                />
                <p>
                  A conflict is unopposed if the attacking player wins the conflict and the
                  defending player controls no defending characters at the time the conflict winner
                  is determined.
                </p>
                <ul>
                  <li>
                    Each time the defending player loses an unopposed conflict in the stronghold
                    format, that player loses 1 honor. The lost honor is returned to the general
                    token pool. This occurs during framework{' '}
                    <a href="#3-2-4-apply-unopposed">step 3.2.4</a>.
                  </li>
                  <li>
                    In the team conquest format, a conflict is only considered unopposed if no
                    player on the defending team controls any defending characters at the time the
                    attacking team wins the conflict. If that is the case, each player on the
                    defending team loses 1 honor.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Winning a Conflict" />
                <p>
                  Each conflict is won by the player who counts the highest total skill applicable
                  for that conflict type for his or her side when the conflict result is determined.
                </p>
                <ul>
                  <li>
                    A player's total skill is the sum of the skill matching the conflict type of
                    each ready participating character on his or her side of the conflict, along
                    with any other modifiers that are affecting the amount of skill the player
                    counts for the conflict.
                  </li>
                  <li>
                    A player must count at least 1 total skill and there must be at least one
                    participating character on his or her side in order to win a conflict.
                  </li>
                  <li>
                    If the total skill counted on each side is tied at a value of 1 or greater (and
                    the attacking player controls at least one participating character), the
                    attacking player wins the conflict.
                  </li>
                  <li>
                    If neither player can meet the requirements of winning a conflict, neither
                    player wins (or loses) that conflict. When this occurs, return the contested
                    ring to the unclaimed ring pool.
                  </li>
                  <li>
                    Some card abilities reference a character "winning" a conflict. In order for a
                    character to be considered to have "won" a conflict, that character must be
                    participating in the conflict on the winning side at the time the ability
                    resolves.
                  </li>
                  <li>
                    Some card abilities reference a character "losing" a conflict. In order for a
                    character to be considered to have "lost" a conflict, that character must be
                    participating in the conflict on the losing side at the time the ability
                    resolves.
                  </li>
                  <li>
                    In the team conquest format, players on a team win or lose the conflict as a
                    team, regardless of who controls participating characters. Any card abilities
                    that trigger when a player wins (or loses) a conflict can be triggered if that
                    player wins (or loses) a conflict.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text="Winning the Game" />
                <p>
                  In each format there are three primary paths to victory in the game. The game ends
                  immediately if a player meets one (or more) of these victory conditions.
                </p>
                <ul>
                  <li>
                    If all but a single player has been eliminated from the game, that player is the
                    game’s winner.
                  </li>
                  <li>
                    Some card abilities can introduce additional victory conditions to the game.
                    Such a condition immediately ends the game if it is met.
                  </li>
                  <li>
                    If two or more players would reach a victory condition simultaneously, the first
                    player wins the game if they have reached a victory condition. If they have not,
                    the player closes to the first player’s left who has reached a victory condition
                    wins the game.
                  </li>
                  <li>Stronghold format victory conditions:</li>

                  <li>
                    <ul>
                      <li>
                        If a player’s stronghold province is broken, that player is eliminated from
                        the game.
                      </li>
                      <li>
                        The first player to meet the condition of having 25 or more honor in their
                        honor pool wins the game.
                      </li>
                      <li>
                        The first player to have 0 honor in their honor pool is eliminated from the
                        game.
                      </li>
                    </ul>
                  </li>

                  <li>Skirmish format victory conditions:</li>

                  <li>
                    <ul>
                      <li>
                        If all three of a player’s province are broken, that player is eliminated
                        from the game.
                      </li>
                      <li>
                        The first player to meet the condition of having 12 or more honor in their
                        honor pool wins the game.
                      </li>
                      <li>
                        When a player has 0 honor in their honor pool, they are eliminated from the
                        game.
                      </li>
                    </ul>
                  </li>

                  <li>Enlightenment format victory conditions:</li>

                  <li>
                    <ul>
                      <li>
                        The first player to collect all five elemental rings on their provinces wins
                        the game.
                      </li>
                      <li>
                        The first player to meet the condition of having 25 or more honor in their
                        honor pool wins the game.
                      </li>
                      <li>
                        If a player’s stronghold province is broken, or if a player has 0 honor in
                        their honor pool, that player is eliminated from the game.
                      </li>
                    </ul>
                  </li>

                  <li>Team conquest format victory conditions:</li>

                  <li>
                    <ul>
                      <li>
                        If the stronghold province of each member of a single team is broken, that
                        team loses the game and the opposing team wins the game.
                      </li>
                      <li>
                        The first team to meet the condition of having 50 or more honor in their
                        honor pool wins the game.
                      </li>
                    </ul>
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text='The word "Would"' />
                <p>
                  The word "would" is used to define the triggering condition of some interrupt
                  abilities, and establishes a higher priority for those abilities than interrupts
                  to the same triggering condition that lack the word "would."
                </p>
                <p>
                  All "would be X" interrupts are eligible to be used before any "is X" interrupts.
                  This means that an interrupt with the word "would" (such as "when a character
                  would leave play") has timing priority over an interrupt without the word "would"
                  that references that same occurrence (such as "when a character leaves play").
                </p>
                <ul>
                  <li>
                    If an interrupt to a triggering condition that would occur changes the nature of
                    that which is about to occur, no further interrupts to the original triggering
                    condition may be used, as that triggering condition is no longer imminent.
                  </li>
                </ul>
              </article>
              <article>
                <AnchoredHeading addHeading={addHeading} level="2" text='The letter "X"' />
                <p>
                  Unless specified by a card ability or granted player choice, the letter X is
                  always equal to 0.
                </p>
                <ul>
                  <li>
                    For costs involving the letter X, the value of X is defined by card ability or
                    player choice, after which the amount paid may be modified by effects without
                    altering the value of X.
                  </li>
                </ul>
              </article>
            </section>
            <section>
              <AnchoredHeading
                addHeading={addHeading}
                level="1"
                text="Appendix I: Timing and Gameplay"
              />
              <p>
                This section provides a detailed overview of the phases and framework steps of an
                entire game round. The "Phase Sequence Timing Chart" depicts each framework step and
                action window that occurs throughout a game round. The "Framework Details" section
                explains how to handle each framework step presented on the game's flow chart, in
                the order that the frameworks steps occur throughout the round.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Framework Steps" />
              <p>
                Numbered (or lettered) items presented in the darker <b>grey</b> boxes are known as
                framework steps. Framework steps are mandatory occurrences dictated by the structure
                of the game. <b>Purple</b>
                windows are special framework steps that indicate the possibility of the game
                returning to an earlier framework step in the chart. These repetitive sequences can
                end in various ways, such as when all players have performed the steps in a
                sequence, or when a player makes a specific decision. Each purple window explains
                when and how the game either loops back or progresses to a later framework step.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Action Windows" />
              <p>
                An action ability may only be triggered during an action window. Action windows are
                presented in lighter <b>orange</b> boxes on the chart. When most action windows
                open, the player or team with the first player token has the first opportunity to
                initiate an action, or pass. The one exception to this is the action window during
                the conflict phase, in which the defending player (or team) has the first
                opportunity to initiate an action, or pass. Opportunities to initiate actions
                alternate between the players in player order until all players consecutively pass,
                at which point the action window closes and the game advances to the next step on
                the timing chart. Note that if a player passes their opportunity to act, but any
                other opponent does not consecutively pass in sequence, the original player may
                still take an action when the alternation of action opportunities returns to the
                player who had passed.
              </p>
              <p>Resolve each action completely before the next action opportunity.</p>
              <p>
                During each action window, players are permitted to play character and attachment
                cards from hand. The one exception to this is step 1.4, during which playing
                character and attachment cards from hand is prohibited.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Reactions and Interrupts" />
              <p>
                A reaction ability to a framework effect may be initiated immediately after the
                completion of any framework step.
              </p>
              <p>
                An interrupt ability to a framework effect may be initiated during the resolution of
                that step, interrupting the process of that step.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="2"
                text="Phase Sequence Timing Chart"
              />
              <table className="chart">
                <tr>
                  <td className="top">I. Dynasty Phase</td>
                </tr>
                <tr>
                  <td>
                    <b>1.1</b> Dynasty phase begins.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>1.2</b> Reveal facedown dynasty cards.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>1.3</b> Collect fate.
                  </td>
                </tr>
                <tr>
                  <td className="action">
                    <b>{'<>'} 1.4 SPECIAL ACTION WINDOW</b>
                    <br />
                    <br />
                    Players alternate playing cards from provinces and/or triggering
                    <b>Action</b> abilities.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>1.5</b> Dynasty phase ends.
                  </td>
                </tr>
                <tr>
                  <td className="bottom">Proceed to Draw Phase.</td>
                </tr>
              </table>
              <br />
              <table className="chart">
                <tr>
                  <td className="top">II. Draw Phase</td>
                </tr>
                <tr>
                  <td>
                    <b>2.1</b> Draw phase begins.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>2.2</b> Honor bid.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>2.3</b> Reveal honor dials.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>2.4</b> Transfer honor.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>2.5</b> Draw cards.
                  </td>
                </tr>
                <tr>
                  <td className="action">
                    <b>{'<>'} ACTION WINDOW</b>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>2.6</b> Draw phase ends.
                  </td>
                </tr>
                <tr>
                  <td className="bottom">Proceed to Conflict Phase.</td>
                </tr>
              </table>
              <br />
              <table className="chart">
                <tr>
                  <td className="top">III. Conflict Phase</td>
                </tr>
                <tr>
                  <td>
                    <b>3.1</b> Conflict phase begins.
                  </td>
                </tr>
                <tr>
                  <td className="action">
                    <b>{'<>'} ACTION WINDOW</b>
                    <br />
                    <br />
                    <b>NOTE</b>: <em>After</em> this action window, if no conflict opportunities
                    remain, proceed to (<b>3.4</b>).
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2</b> Next player in player order declares a conflict (go to
                    <b>Conflict Resolution</b>), or passes (go to (<b>3.3</b>).
                  </td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: '#dda0dd' }}>
                    <b>3.3</b> Conflict Ends / Conflict was passed. Return to the action window
                    following step (<b>3.1</b>).
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.4</b> Determine Imperial Favor.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.4.1</b> Glory count.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.4.2</b> Claim Imperial Favor.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.5</b> Conflict phase ends.
                  </td>
                </tr>
                <tr>
                  <td className="bottom">Proceed to Fate Phase.</td>
                </tr>
              </table>
              <br />
              <table className="chart">
                <tr>
                  <td className="top">Conflict Resolution</td>
                </tr>
                <tr>
                  <td>
                    <b>3.2</b> Declare conflict.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.1</b> Declare defenders.
                  </td>
                </tr>
                <tr>
                  <td className="action">
                    <b>{'<>'} 3.2.2 CONFLICT ACTION WINDOW</b>
                    <br />
                    (Defender has first opportunity)
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.3</b> Compare skill values and determine result.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.4</b> Apply unopposed.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.5</b> Break province.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.6</b> Resolve ring effects.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.7</b> Claim ring.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>3.2.8</b> Return home. Go to (<b>3.3</b>).
                  </td>
                </tr>
              </table>
              <br />
              <table className="chart">
                <tr>
                  <td className="top">IV. Fate Phase</td>
                </tr>
                <tr>
                  <td>
                    <b>4.1</b> Fate phase begins.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.2</b> Discard characters with no fate.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.3</b> Remove fate from characters.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.4</b> Place fate on unclaimed rings (if applicable).
                  </td>
                </tr>
                <tr>
                  <td className="action">
                    <b>{'<>'} ACTION WINDOW</b>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.5</b> Ready cards.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.6</b> Discard from provinces.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.7</b> Return rings (if applicable).
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.8</b> Pass first player token.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>4.9</b> Fate phase ends.
                  </td>
                </tr>
                <tr>
                  <td className="bottom">Proceed to Dynasty Phase.</td>
                </tr>
              </table>
              <AnchoredHeading addHeading={addHeading} level="1" text="Framework Details" />
              <p>
                Each of the following entries corresponds to the framework step of the same number
                on the Phase Sequence Timing Chart.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="1. Dynasty Phase" />
              <AnchoredHeading addHeading={addHeading} level="3" text="1.1. Dynasty phase begins" />
              <p>
                This step formalizes the beginning of the dynasty phase. As this is the first
                framework step of the round, it also formalizes the beginning of a new game round.
              </p>
              <p>
                The beginning of a phase is an important game milestone that may be referenced in
                card text, either as a point at which an ability may or must resolve, or as a point
                at which a lasting effect or constant ability begins or expires.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="1.2. Reveal facedown dynasty cards"
              />
              <p>
                In player order, each player turns each facedown dynasty card in each of their
                provinces faceup. A player’s cards are turned over one at a time, from the player’s
                leftmost province to their rightmost province. If there are any facedown cards in a
                player’s stronghold province, those cards are turned faceup first.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="1.3. Collect fate" />
              <p>
                In player order, each player collects fate equal to the fate value on his or her
                stronghold card, incorporating all active fate modifiers. This fate is taken from
                the general token pool and added to the player's fate pool.
              </p>
              <ul>
                <li>
                  In the enlightenment format, the first player collects 1 additional fate during
                  the dynasty phase.
                </li>
              </ul>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="1.4. Play cards from provinces"
              />
              <p>
                This is a special action window in which the opportunity to act alternates back and
                forth between the players, in player order.
              </p>
              <p>With his or her opportunity to act, a player may do one of the following:</p>
              <ul>
                <li>Play one character from his or her provinces.</li>
                <li>Trigger an eligible action ability.</li>
                <li>
                  Discard a duplicate of a character from his or her hand or from one of his or her
                  provinces to place 1 fate on a copy of that character under his or her control.
                </li>
                <li>Pass.</li>
              </ul>
              <p>
                <b>NOTE</b>: During this window, a player is not permitted to play character or
                attachment cards from his or her hand.
              </p>
              <p>
                To play a character from a province, a player removes a number of fate equal to the
                character's fate cost from his or her fate pool, and returns that fate to the
                general token pool. The character enters play and is placed in the player's home
                area. The player then has the option to place any number of additional fate from his
                or her fate pool onto that character. Once this option to place additional fate has
                been completed or passed, the province from which the character was played is
                refilled facedown from the dynasty deck.
              </p>
              <p>
                When a player passes, that player relinquishes all further opportunities to act
                during this phase. (A player who has passed may still trigger interrupts and
                reactions to any eligible occurrence.) The player to pass first gains 1 fate from
                the general token pool and adds it to his or her fate pool. After one player has
                passed, the other player may continue to use action opportunities until he or she
                also passes. Once both players have passed, this step is complete.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="1.5. Dynasty phase ends" />
              <p>This step formalizes the end of the dynasty phase.</p>
              <p>
                The end of a phase is an important game milestone that may be referenced in card
                text, either as a point at which an ability may or must resolve, or as a point at
                which a lasting effect or constant ability expires or begins.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="2. Draw Phase" />
              <AnchoredHeading addHeading={addHeading} level="3" text="2.1. Draw phase begins" />
              <p>This step formalizes the beginning of the draw phase.</p>
              <AnchoredHeading addHeading={addHeading} level="3" text="2.2. Honor bid" />
              <p>
                Each player secretly selects a number from 1 to 5 on his or her honor dial as his or
                her honor bid for this round. Once both players have confirmed that they are ready,
                proceed to the next step.
              </p>
              <ul>
                <li>
                  In the skirmish format, players cannot select a number higher than 3 on their
                  honor dial.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="2.3. Reveal honor dials" />
              <p>The players simultaneously reveal their bids.</p>
              <p>
                Once a player reveals an honor bid, the dial is placed next to the player's
                stronghold or conflict deck and remains as a reference point until the next honor
                bid occurs.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="2.4. Transfer honor" />
              <p>
                The player with the higher honor bid must give an amount of honor to the player with
                the lower honor bid that is equal to the difference between the two bids. If the
                bids are equal, no honor is transferred during this step.
              </p>
              <ul>
                <li>
                  In the enlightenment format, all three players compare their honor bids with one
                  another for the purposes of transferring honor.
                </li>
                <ul>
                  <li>
                    If each player selects a different number on their honor dial, the player who
                    selects the highest number gives honor to the player who selects the lowest
                    number. The amount of honor given is equal to the difference between the numbers
                    those two players select. The player whose number is in between the other two
                    does not gain or lose honor.
                  </li>
                  <li>
                    If two players select the same number and the remaining player selects a number
                    that is higher than that selected by their two opponents, the player that
                    selected the higher number gives honor to both opponents. The amount of honor
                    given is equal to the difference between the two numbers selected, divided as
                    evenly as possible between the two players that selected the same number. If any
                    honor remains to be given after dividing the honor as evenly as possible, the
                    player giving the honor selects which opponent the remaining honor is given to.
                  </li>
                  <li>
                    If two players select the same number and the remaining player selects a number
                    that is lower than that selected by their two opponents, the player that
                    selected the lower number takes honor from both opponents. The total amount of
                    honor taken is equal to the difference between the two numbers selected, divided
                    as evenly as possible between the two players that selected the same number. If
                    any honor remains to be taken after dividing it as evenly as possible, the
                    player receiving the honor selects which opponent to take the remaining honor
                    from.
                  </li>
                </ul>
                <li>
                  In the team conquest format, each player only compares their honor bid with that
                  of the opponent sitting across from them for the purposes of transferring honor.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="2.5. Draw cards" />
              <p>
                Each player simultaneously draws a number of cards from their conflict deck equal to
                their honor bid.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="2.6. Draw phase ends" />
              <p>This step formalizes the end of the draw phase.</p>
              <AnchoredHeading addHeading={addHeading} level="2" text="3. Conflict Phase" />
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.1. Conflict phase begins"
              />
              <p>This step formalizes the beginning of the conflict phase.</p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2. Declare conflict" />
              <p>(Shares 3.2 with conflict resolution chart.)</p>
              <p>
                During the conflict phase, each player is granted one or more opportunities to
                declare a conflict. These conflict opportunities alternate between players with
                remaining conflict opportunities in player order until each player has declared a
                conflict or passed on each of their conflict opportunities. In the team conquest
                format, conflict opportunities are given to each team instead of each player.
              </p>
              <p>
                In the stronghold, enlightenment, and team conquest formats, each player (or team)
                is granted one opportunity to declare a military conflict and one opportunity to
                declare a political conflict. A player’s military and political conflicts may be
                declared in either order during the round. In the skirmish format, each player is
                granted one opportunity to declare a conflict of either type.
              </p>
              <p>When a player has an opportunity to declare a conflict, that player may:</p>
              <ul>
                <li>Declare a military conflict.</li>
                <li>Declare a political conflict.</li>
                <li>Pass.</li>
              </ul>
              <p>
                If a conflict opportunity is passed, the player forfeits his or her right to use
                that opportunity this phase.
              </p>
              <p>In order to declare a conflict, the attacking player must:</p>
              <ul>
                <li>
                  <p>
                    Declare the type and element of the conflict to be initiated. This is indicated
                    by selecting a ring from the unclaimed ring pool (this ring is known as the
                    contested ring, and defines the element of the conflict), and placing it on an
                    opponent's eligible unbroken province (this indicates which province is being
                    attacked) with either the military side or the political side faceup (the faceup
                    side of the contested ring defines the type of the conflict).
                  </p>
                  <p>
                    A conflict cannot be declared against a player’s stronghold province in the
                    stronghold or enlightenment formats unless at least three of that player’s
                    non-stronghold provinces are broken. A conflict cannot be declared against a
                    player’s stronghold province in the team conquest format unless that player’s
                    team controls at least 3 broken provinces and at least one of that player’s
                    non-stronghold provinces is broken.
                  </p>
                  <p>
                    If a player selects an unclaimed ring with fate on it to become the contested
                    ring, that fate is moved from the ring to the attacking player's fate pool.
                  </p>
                </li>
                <ul>
                  <li>
                    In the enlightenment format, a player can only declare a conflict using a ring
                    in their personal unclaimed ring pool or the common unclaimed ring pool.
                  </li>
                </ul>
              </ul>
              <ul>
                <li>
                  Declare which <b>ready</b> characters (under his or her control) are being
                  committed as attackers. The attacking player may declare any number of eligible
                  characters under his or her control as attackers. Slide these characters toward
                  the center of the play area, away from the attacking player's home area. At least
                  one character must be declared as an attacker at this time in order to initiate a
                  conflict. If any of the attackers have the covert keyword, the targets for covert
                  are chosen at this time.
                </li>
                <ul>
                  <li>
                    In the team conquest format, each player on the attacking team may declare
                    attackers in the same conflict, and those characters participate on the same
                    side together.
                  </li>
                </ul>
              </ul>
              <p>
                Each of the above items are considered to be performed simultaneously. If any of the
                above cannot be completed, the conflict cannot be initiated.
              </p>
              <p>
                If the province being attacked is facedown, turn it faceup as soon as a conflict is
                successfully declared against it. This occurs before any reactions to the process of
                conflict declaration may be triggered.
              </p>
              <p>
                Once a conflict has been declared, resolve that conflict before the next conflict is
                declared.
              </p>
              <p>
                If no player has a conflict opportunity remaining when this step is reached, advance
                to step 3.4.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2.1. Declare defenders" />
              <p>
                The defending player declares which &ndash; if any &ndash; ready characters (under
                his or her control) are being committed as defenders. The defending player may
                declare any number of eligible characters under his or her control as defenders.
                Slide these characters toward the center of the play area, away from the defending
                player's home area. Declaring "no defenders" is also an option.
              </p>
              <ul>
                <li>
                  In the team conquest format, the controller of the attacked province may declare
                  one or more defenders if they choose, and each other player on their team may
                  declare up to one one defender. Those characters participate on the same side
                  together.
                </li>
              </ul>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.2.2. Conflict action window"
              />
              <p>
                This is a special action window in which the defending player (rather than the first
                player) has the first action opportunity. These opportunities then alternate between
                the players until both players consecutively pass.
              </p>
              <p>With an action opportunity, a player may:</p>
              <ul>
                <li>Activate an eligible action ability on a card he or she controls.</li>
                <li>Play an event card with an action trigger from his or her hand.</li>
                <li>
                  Play an attachment card from hand, and attach it to any eligible character in
                  play.
                </li>
                <li>
                  Play a character from hand, into the conflict, participating on that player's
                  side. (Additional fate from the player's fate pool may be placed on the character
                  at this time.)
                </li>
                <li>
                  Play a character from hand into his or her home area. (Additional fate from the
                  player's fate pool may be placed on the character at this time.)
                </li>
                <li>Pass.</li>
              </ul>
              <p>
                After using an action opportunity, a player must announce the total relevant skill
                present on both sides of the conflict that would be counted if the conflict were to
                resolve with no further actions.
              </p>
              <p>
                Once both players consecutively pass their action opportunities, proceed to the next
                step.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.2.3. Compare skill values and determine result"
              />
              <p>
                The conflict type indicates which skill value is used to resolve the conflict.
                During a military conflict use military skill. During a political conflict use
                political skill.
              </p>
              <p>
                First, determine the attacking player's total skill in the conflict by adding
                together the skill (that matches the conflict type) of each ready attacking
                character and factor in all active modifiers. Then determine the defending player's
                total skill in the conflict by adding together the skill (that matches the conflict
                type) of each ready defending character and factor in all active modifiers.
              </p>
              <p>
                The player whose side has the higher total skill wins the conflict. In order to win
                a conflict, a player must count a total skill of 1 or higher. In the case of a tie,
                the conflict is won by the attacking player. If both players count 0 skill, the
                conflict resolves with no winner, and the ring is returned to the pool of unclaimed
                rings.
              </p>
              <ul>
                <li>
                  In the team conquest format, players win or lose the conflict as a team,
                  regardless of who controls participating characters. Any card abilities that
                  trigger when a player wins a conflict can be triggered if that player’s team wins
                  a conflict (the same is true for losing a conflict), as each player on that team
                  counts as having won the conflict.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2.4. Apply unopposed" />
              <p>
                If the attacking player won the conflict and the defending player controls no
                defending characters (in step 3.2.3), the conflict is considered "unopposed." If
                playing the stronghold or team conquest format, the defending player loses 1 honor
                and returns it to the general token pool.
              </p>
              <p>
                If the defending player or no player won the conflict, nothing happens during this
                step.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2.5. Break province" />
              <p>
                If the attacking player won the conflict by an amount equal to or greater than the
                strength of the attacked province (in step 3.2.3), the province is broken. Rotate
                the province 180 degrees or discard the province token to indicate this.
              </p>
              <p>
                If the attacking player wins a conflict and breaks a province, they may immediately
                discard any dynasty cards on that province. If the province becomes empty this way,
                the province is refilled facedown as normal.
              </p>
              <p>
                If the defending player or no player won the conflict, nothing happens during this
                step.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.2.6. Resolve ring effects"
              />
              <p>
                If the attacking player won the conflict (in step 3.2.3), that player may resolve
                the ring effect of the contested ring. The ring effects are as follows:
              </p>
              <p>
                <b>Air</b>: Either take 1 honor from your opponent, or gain 2 honor from the general
                token pool.
              </p>
              <p>
                <b>Earth</b>: Draw 1 card from your conflict deck and discard 1 random card from
                your opponent's hand.
              </p>
              <p>
                <b>Fire</b>: Choose a character in play and either honor or dishonor that character.
              </p>
              <p>
                <b>Water</b>: Either choose a character and ready it, or choose a character with no
                fate on it and bow it.
              </p>
              <p>
                <b>Void</b>: Choose a character and removes 1 fate from it.
              </p>
              <p>
                If the defending player or no player won the conflict, nothing happens during this
                step.
              </p>
              <ul>
                <li>
                  When playing the skirmish format, the following three rings have the following
                  effects instead:
                </li>
                <ul>
                  <li>[b]Air:[/b] Take 1 honor from your opponent.</li>
                  <li>
                    [b]Earth:[/b] Either draw 1 card from your conflict deck or discard 1 random
                    card from your opponent’s hand.
                  </li>
                  <li>
                    [b]Water[/b]: Choose a character in any player’s home area with 1 or fewer fate
                    on it and either ready or bow it.
                  </li>
                </ul>
                <li>
                  In the team conquest format, the Air and Earth ring effects may only be resolved
                  against the opponent whose province is being attacked, and only a single player on
                  the attacking team may receive the ring’s effect.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2.7. Claim ring" />
              <p>
                The player who won the conflict (in step 3.2.3) claims the contested ring and adds
                it to his or her claimed ring pool.
              </p>
              <ul>
                <li>
                  In the enlightenment format, the attacking player claims the ring on one of their
                  eligible provinces if they win the conflict. The defending player does not claim
                  the ring if they win the conflict, and it is returned to the attacking player’s
                  personal unclaimed ring pool.
                </li>
              </ul>
              <p>
                If no player won the conflict (in step 3.2.3), the ring is returned to the unclaimed
                ring pool.
              </p>
              <p>
                The ring continues to define the conflict type and element(s) until the end of the
                conflict even after it ceases to be contested.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.2.8. Return home" />
              <p>
                Simultaneously bow each ready participating character in the conflict. Return each
                participating character to its controller's home area. These characters are no
                longer participating in the conflict.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.3. Conflict ends / Conflict was passed"
              />
              <p>
                This step formalizes the end of a conflict, or that a conflict opportunity has been
                passed. Return to the action window following step 3.1.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.4. Determine Imperial Favor"
              />
              <p>This step marks the beginning of the contest for the Imperial Favor.</p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.4.1. Glory count" />
              <p>
                Each player counts the total glory value of all ready characters he or she controls,
                factors in all active modifiers, and adds 1 to this count for each ring in his or
                her claimed ring pool.
              </p>
              <p>
                The players then compare their totals. The player with the higher total wins the
                glory count. If the totals are tied, neither player wins the glory count.
              </p>
              <ul>
                <li>
                  In the team conquest format, each team adds together the total glory on ready
                  characters they control and adds one for each ring claimed by their team. This
                  total is compared to that of the opposing team, and one of the two teams wins the
                  glory count if the totals are not tied.
                </li>
              </ul>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="3.4.2. Claim Imperial favor"
              />
              <p>
                The player who won the glory count (in step 3.4.1) claims the Imperial Favor by
                taking the Imperial Favor card, setting it to its military side or to its political
                side, and placing it next to his or her stronghold. That player is said to "have the
                Imperial Favor," and the card may influence the following game round. If a player
                who already has the Imperial Favor claims it again, the player may set it to either
                side.
              </p>
              <p>
                If players have the same total, the Imperial Favor remains in its current state
                (either unclaimed or under the possession of the player who currently has it,
                remaining set on its current side).
              </p>
              <p>This step also marks the end of the contest for the Imperial Favor.</p>
              <AnchoredHeading addHeading={addHeading} level="3" text="3.5. Conflict phase ends" />
              <p>This step formalizes the end of the conflict phase.</p>
              <AnchoredHeading addHeading={addHeading} level="2" text="4. Fate Phase" />
              <AnchoredHeading addHeading={addHeading} level="3" text="4.1. Fate phase begins" />
              <p>This step formalizes the beginning of the fate phase.</p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="4.2. Discard characters with no fate"
              />
              <p>
                In player order, each player discards each character he or she controls with no fate
                on it. These characters are discarded one at a time, in the order of the discarding
                player's choosing. Characters are only discarded in this way if they had no fate on
                them during the initation of this step and no fate when they would be discarded.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="4.3. Remove fate from characters"
              />
              <p>Simultaneously remove 1 fate from each character in play.</p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="4.4. Place fate on unclaimed rings"
              />
              <p>Simultaneously place 1 fate from the general token pool on each unclaimed ring.</p>
              <ul>
                <li>This framework step is skipped when playing the skirmish format.</li>
                <li>
                  In the enlightenment format, instead of placing 1 fate on each unclaimed ring,
                  each player chooses 1 ring in an opponent’s unclaimed ring pool and places 1 fate
                  from the general token pool on that ring.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="4.5. Ready cards" />
              <p>Simultaneously ready each bowed card in play.</p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="4.6. Discard from provinces"
              />
              <p>
                In player order, each player must discard each faceup card from each his or her
                broken provinces, and also has the opportunity to choose and discard any number of
                faceup dynasty cards from his or her unbroken provinces.
              </p>
              <p>
                Each province that becomes empty in this way is refilled with a facedown card from
                the top of its owner’s dynasty deck.
              </p>
              <ul>
                <li>
                  In the skirmish format, players do not discard faceup cards in broken provinces
                  unless they choose to do so.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="4.7. Return rings" />
              <p>Simultaneously return each claimed ring to the unclaimed ring pool.</p>
              <ul>
                <li>This framework step is skipped when playing the enlightenment format.</li>
              </ul>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="4.8. Pass first player token"
              />
              <p>
                The player with the first player token passes it to the opponent to their left. That
                player becomes the first player.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="4.9. Fate phase ends" />
              <p>This step formalizes the end of the fate phase.</p>
              <p>
                As the fate phase is the final phase in the round, this step also formalizes the end
                of the round. Any active "until the end of the round" lasting effects expire at this
                time.
              </p>
              <p>
                After this step is complete, play proceeds to the beginning of the dynasty phase of
                the next game round.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Duel Timing" />
              <table className="chart">
                <tr>
                  <td id="Duel_Timing" className="top">
                    D. Duel Timing
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.1</b> Initiate a duel.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.2</b> Establish the challenge.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.3</b> Duel honor bid.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.4</b> Reveal honor dials.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.5</b> Transfer honor.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.6</b> Calculate dueling statistic.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.7</b> Add honor bid, compare values, and determine result.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.8</b> Apply duel results.
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>D.9</b> Duel ends.
                  </td>
                </tr>
              </table>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.1. Initiate a duel" />
              <p>
                When a card ability initiates a duel, part of the cost of that ability may use the
                phrase, “initiate a [type] duel." This opens the duel timing window.
              </p>
              <p>
                To initiate a duel, the player resolving the card ability must choose two characters
                to duel against each other: one they control and one controlled by an opponent. The
                following parameters exist on which characters can be chosen for the duel:
              </p>
              <ul>
                <li>
                  One character must be controlled by the player whose card ability initiates the
                  duel, and one character must be controlled by an opponent of that player.
                </li>
                <li>
                  If a duel is initiated during a conflict, both characters chosen must be
                  participating.
                </li>
                <li>
                  If a duel is initiated by an ability on a character card, that character is
                  automatically involved in the duel. Some abilities use the phrase “this character
                  initiates" as a reminder of this. That character is not considered to be chosen as
                  a target of the duel, as it is already involved.
                </li>
                <ul>
                  <li>
                    During a conflict, a duel can only be initiated by an ability on a character
                    card if that character is participating in the conflict.
                  </li>
                </ul>
              </ul>
              <p>
                If this process is completed, a duel has been initiated. Otherwise, the duel fails
                to initiate and cannot resolve.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="Resolve the duel" />
              <p>
                A duel is resolved during the successful resolution of any triggered ability that
                instructs players to “resolve the duel," or that their “character challenges the
                opponent’s character to a [type] duel." To resolve a duel, perform the following
                steps:
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="D.2. Establish the challenge"
              />
              <p>
                The process of initiating the duel (in step D.1) will have identified the two
                characters that are involved in the duel, as well as the kind of duel that will take
                place. This statistic (<span className="icon icon-conflict-military" /> skill,{' '}
                <span className="icon icon-conflict-political" /> skill, or glory) will be used to
                determine the results of the duel.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.3. Duel honor bid" />
              <p>
                Each player secretly selects a number from 1 to 5 on his or her honor dial as his or
                her honor bid for this duel. Once both players have confirmed that they are ready,
                proceed to the next step.
              </p>
              <ul>
                <li>
                  In the skirmish format, players cannot select a number higher than 3 on their
                  honor dial.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.4. Reveal honor dials" />
              <p>The players simultaneously reveal their bids.</p>
              <p>
                Once a player reveals an honor bid, the dial is placed next to the player’s
                stronghold or conflict deck and remains as a reference point until the next honor
                bid occurs.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.5. Transfer honor" />
              <p>
                The player with the higher honor bid must give an amount of honor to the player with
                the lower honor bid that is equal to the difference between the two bids. If the
                bids are equal, no honor is transferred during this step.
              </p>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="D.6. Calculate dueling statistic"
              />
              <p>
                The process of initiating the duel (in step D.1) will have established which
                statistic (<span className="icon icon-conflict-military" /> skill,{' '}
                <span className="icon icon-conflict-political" /> skill, or glory) is being used to
                determine the results of the duel. Each player calculates the current value of that
                statistic for their character involved in the duel. Any skill modifiers that were
                active at the time the duel was initiated are still applicable during the duel.
              </p>
              <ul>
                <li>
                  If multiple characters are involved in the duel on the same side, add their
                  dueling statistics together. The value calculated in this step is treated as the
                  skill value of a single character for the purposes of determining duel results.
                  Those characters win or lose the duel together
                </li>
              </ul>
              <AnchoredHeading
                addHeading={addHeading}
                level="3"
                text="D.7. Add honor bid, compare values, and determine result"
              />
              <p>
                Each player calculates their duel total and compares it with that of their opponent
                to determine the results.
              </p>
              <p>
                In the stronghold, enlightenment, and team conquest formats, each player adds their
                duel honor bid to the statistic value they calculated in step D.6 to determine their
                duel total.
              </p>
              <p>
                In the skirmish format, the player with the higher dueling statistic value
                calculated in step D.6 adds 1 to their honor bid to determine their duel total. The
                other player’s duel total is equal to their honor bid and is not increased by the
                dueling statistic.
              </p>
              <ul>
                <li>
                  The character whose controller has the higher duel total is the duel’s winner.
                </li>
                <li>
                  The character whose controller has the lower duel total is the duel’s loser.
                </li>
                <li>
                  If the duel totals are the same, neither character is the duel’s winner and
                  neither character is the duel’s loser.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.8. Apply duel results" />
              <p>
                The ability that initiated the duel (in step D.1) specified the consequences of this
                duel for the winning and/or losing characters, or for the player(s) controlling
                those characters. Apply those consequences during this step.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="D.9. Duel ends" />
              <p>
                This step formalizes the end of the duel. Return to the action window in which the
                duel was initiated, with the next player in the sequence of actions having the next
                opportunity to act.
              </p>
              <p>
                <b>NOTE</b>: There are no action windows during a duel, so players are not able to
                initiate actions or play characters and attachments from their hands during the
                resolution of a duel. Applicable interrupt and/or reaction abilities may be
                triggered during a duel.
              </p>
            </section>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="Appendix II: Card Anatomy" />
              <p>
                This section presents a detailed anatomy of each cardtype. Definitions of each
                element can be found in the glossary.
              </p>
              <AnchoredHeading addHeading={addHeading} level="3" text="Card Anatomy Key" />
              <ol>
                <li>
                  <b>Title</b>: The name of the card.
                </li>
                <li>
                  <b>Cost</b>: The fate cost to play the card.
                </li>
                <li>
                  <b>Cardtype</b>: Indicates how a card is played or used during the course of the
                  game.
                </li>
                <li>
                  <b>Clan Symbol</b>: The card's clan affiliation.
                </li>
                <li>
                  <b>Military Skill</b>: The character's military skill value.
                </li>
                <li>
                  <b>Bonus Military Skill</b>: The bonus value this card provides to the attached
                  character's military skill.
                </li>
                <li>
                  <b>Political Skill</b>: The character's political skill value.
                </li>
                <li>
                  <b>Bonus Political Skill</b>: The bonus value this card provides to the attached
                  character's political skill.
                </li>
                <li>
                  <b>Glory</b>: The card's glory value.
                </li>
                <li>
                  <b>Element</b>: This indicates the province's elemental affiliation.
                </li>
                <li>
                  <b>Strength</b>: The province's strength value.
                </li>
                <li>
                  <b>Bonus Strength</b>: The bonus strength provided to a province or stronghold if
                  this holding is in it.
                </li>
                <li>
                  <b>Starting Honor</b>: The amount of honor this stronghold provides at the start
                  of the game.
                </li>
                <li>
                  <b>Fate Value</b>: The amount of fate this stronghold provides each dynasty phase.
                </li>
                <li>
                  <b>Influence Value</b>: The amount of influence this stronghold provides for
                  deckbuilding.
                </li>
                <li>
                  <b>Traits</b>: Descriptive attributes that may be referenced by card abilities.
                </li>
                <li>
                  <b>Ability</b>: The card's special means of interacting with the game.
                </li>
                <li>
                  <b>Influence Cost</b>: The influence cost required to include this card in a
                  conflict deck.
                </li>
                <li>
                  <b>Product Set Information</b>: Indicates this card's product of origin.
                </li>
              </ol>
            </section>
            <section>
              <AnchoredHeading
                addHeading={addHeading}
                level="1"
                text="Appendix III: Card Clarifications"
              />
              <p>
                This section provides answers to a number of common questions that are asked about
                cards in the game. These answers are organized by the expansion and collector number
                of the card whose rules interaction has raised the question.
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Core Set" />
              <h5>
                <a href={`${host}/card/shameful-display`} target="_blank">
                  Shameful Display
                </a>
                (24)
              </h5>
              <ul>
                <li>
                  Neither the honoring nor the dishonoring aspect of Shameful Display’s ability is
                  dependent upon the other. Additionally, targets for the ability may be chosen even
                  if one or both of those characters could be either honored or dishonored (you do
                  not need to select which character is receiving which aspect when choosing
                  targets). If Shameful Display honors/dishonors one character and fails to
                  honor/dishonor the other, it has still resolved successfully, even though it
                  failed to affect one of the chosen characters. That character is still a valid
                  target for the ability as it could have been affected by either aspect at the time
                  it was chosen.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/savvy-politician`} target="_blank">
                  Savvy Politician
                </a>
                (45)
              </h5>
              <ul>
                <li>
                  Savvy Politician’s ability does not trigger if an honored status token is moved to
                  it by a card ability. It only triggers if an effect “honors" it.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/young-rumormonger`} target="_blank">
                  Young Rumormonger
                </a>
                (101)
              </h5>
              <ul>
                <li>
                  Young Rumormonger’s ability does not trigger if an honored or dishonored status
                  token is moved to a character by a card ability. It only triggers if an effect
                  “honors" or “dishonors" a character.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/reprieve`} target="_blank">
                  Reprieve
                </a>
                (132)
              </h5>
              <ul>
                <li>Reprieve’s effect can prevent a character from being sacrificed.</li>
                <ul>
                  <li>
                    If that occurs during the payment of a <u>cost</u>, then that cost is not
                    considered to have been paid as the sacrifice was prevented (see page 5). If the
                    sacrifice while paying an event’s cost is prevented, the effects do not initiate
                    and that event remains unplayed in its owner’s hand.
                  </li>
                  <li>
                    If that occurs during the resolution of an <u>effect</u>, then nothing is
                    dependent upon whether or not the sacrifice resolved successfully. In the same
                    way that an event whose effects were canceled by Voice of Honor (Core, 145) is
                    still considered to have been played, a card like Way of the Crab (Core, 137) is
                    still considered to have been played even if its effects are prevented by
                    Reprieve.
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/watch-commander`} target="_blank">
                  Watch Commander
                </a>
                (133)
              </h5>
              <ul>
                <li>
                  If a player plays a card whose effects result in Watch Commander being discarded,
                  its ability cannot be triggered as it is no longer in play.
                </li>
                <li>
                  If a player plays a card whose effects result in the attached character no longer
                  participating in the conflict, Watch Commander’s ability cannot be triggered as
                  the triggering condition is no longer met.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/steward-of-law`} target="_blank">
                  Steward of Law
                </a>
                (139)
              </h5>
              <ul>
                <li>
                  If a character “cannot receive dishonored status tokens," then those tokens cannot
                  be placed on or moved to that character. That character cannot be dishonored if it
                  is ordinary. (See page 32.)
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/above-question`} target="_blank">
                  Above Question
                </a>
                (141)
              </h5>
              <ul>
                <li>
                  If Above Question is played on an opponent’s character, that opponent cannot
                  choose the attached character as a target for their own events.
                </li>
                <ul>
                  <li>
                    If the attached character is the only participating character controlled by that
                    opponent, Court Games’s honoring effect (Core, 206) cannot be selected, as the
                    attached character cannot be chosen as a target.
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/way-of-the-lion`} target="_blank">
                  Way of the Lion
                </a>
                (167)
              </h5>
              <ul>
                <li>
                  When you play two copies of Way of the Lion on the same character during a
                  conflict, that character’s <span className="icon icon-conflict-military" /> skill
                  will be doubled twice (to now be quadruple the original skill value). The new base
                  skill value continues to double if additional copies are played.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/display-of-power`} target="_blank">
                  Display of Power
                </a>
                (179)
              </h5>
              <ul>
                <li>
                  When Display of Power is played, it produces a delayed effect that cancels the
                  normal effects of ring resolution during step 3.2.6 “Resolve Ring Effects" and
                  replaces it with “resolve the ring effect as if you had won the conflict as the
                  attacking player." Losing honor for unopposed and breaking the province will occur
                  before resolving Display of Power’s effect.
                </li>
                <ul>
                  <li>
                    Should Pilgrimage (Core, 22) not be broken when Display of Power resolves, the
                    delayed effect of Display takes precedence over Pilgrimage, canceling the normal
                    resolution of “Resolve Ring Effects" and replacing it with the adjusted means of
                    resolution. However, the Pilgrimage effect (“cancel all ring effects") still
                    cancels the Display of Power’s attempt to resolve the ring for the defender. The
                    defender claims the ring.
                  </li>
                  <li>
                    Because Display of Power interacts with the “Resolve Ring Effects" step rather
                    than the specific effect chosen by the attacker, the attacker does not have the
                    option to choose a specific ring effect to resolve when Seeker of Knowledge
                    (Core, 171) is attacking (or whether they would like to resolve a ring effect at
                    all). When Display of Power resolves the ring effect, the defender has the
                    opportunity to choose which ring effect they would like to resolve instead, and
                    may choose to not resolve the ring’s effect if they desire.
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/banzai`} target="_blank">
                  Banzai!
                </a>
                (204)
              </h5>
              <ul>
                <li>
                  When Banzai! is played, a player can choose to cancel Banzai!’s entire card
                  effect, just the second part of its effect, or none of its effect.
                </li>
                <ul>
                  <li>
                    When Banzai!’s effect initiates during the step 6 of playing the card (see page
                    11), the effects that initiate are: “you may lose 1 honor, the chosen character
                    gets +2
                    <span className="icon icon-conflict-military" /> , and if you lost 1 honor
                    resolve this ability twice." If Banzai!’s effects are canceled at this time,
                    none of those things happen and the card’s effects do not resolve at all. <br />
                    <br />
                    If those effects resolve, and the 1 honor is lost, “resolve this ability twice"
                    causes the ability’s resolution to return to step 5 (“choose a participating
                    character"). This causes the effects to initiate a second time, and thus they
                    can be canceled a second time to prevent the second +2
                    <span className="icon icon-conflict-military" />
                    and optional honor loss.
                  </li>
                </ul>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Disciples of the Void" />
              <h5>
                <a href={`${host}/card/secluded-shrine`} target="_blank">
                  Secluded Shrine
                </a>
                (12)
              </h5>
              <ul>
                <li>
                  The ring chosen for Secluded Shrine’s effect can be in multiple states at once.
                  For example, while unclaimed, the chosen ring simultaneously counts as being in
                  both the unclaimed ring pool and in your claimed ring pool.
                </li>
                <ul>
                  <li>
                    You cannot move the chosen ring out of your claimed ring pool due to the cost or
                    effect of a card ability unless the physical ring token is in your claimed ring
                    pool.
                  </li>
                </ul>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Warriors of the Wind" />
              <h5>
                <a href={`${host}/card/agasha-taiko`} target="_blank">
                  Agasha Taiko
                </a>
                (14)
              </h5>
              <ul>
                <li>
                  The province that is chosen by Agasha Taiko’s ability cannot be declared as the
                  attacked province and the conflict cannot be moved to it.
                </li>
                <ul>
                  <li>
                    If Agasha Taiko is played during a conflict and chooses the currently attacked
                    province for her ability, the conflict immediately ends with no winner and all
                    participating characters are moved home bowed.
                  </li>
                </ul>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Masters of the Court" />
              <h5>
                <a href={`${host}/card/maker-of-keepsakes`} target="_blank">
                  Maker of Keepsakes
                </a>
                (7)
              </h5>
              <ul>
                <li>
                  If a character “cannot receive dishonored status tokens," then those tokens cannot
                  be placed on or moved to that character. That character cannot be dishonored if it
                  is ordinary.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Seekers of Wisdom" />
              <h5>
                <a href={`${host}/card/dragon-tattoo`} target="_blank">
                  Dragon Tattoo
                </a>
                (23)
              </h5>
              <ul>
                <li>
                  After you play an interrupt or reaction event that targets a character with Dragon
                  Tattoo attached, the tattoo can be used to play that event again. The interrupt or
                  reaction event is played during the interrupt/reaction window that the card was
                  originally played in.
                </li>
                <ul>
                  <li>
                    When an interrupt or reaction is played in this way, it is “queued" into the
                    appropriate interrupt/reaction window, but is not actually played until the
                    reaction window for playing the original event closes. Therefore, cards like
                    Watch Commander (Core, 133) will trigger after the first instance of the event
                    but before the second instance of the event—this is different from when Dragon
                    Tattoo plays an action event, as an Action event (such as Hurricane Punch
                    (Elemental Cycle, 17)) is fully played and resolved within the resolution of
                    Dragon Tattoo’s ability.
                  </li>
                </ul>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Imperial Cycle" />
              <h5>
                <a href={`${host}/card/test-of-skill`} target="_blank">
                  Test of Skill
                </a>
                (93)
              </h5>
              <ul>
                <li>
                  If you play Test of Skill from the top of your deck (with a card such as Artisan
                  Academy (Core, 53) or Pillow Book (Imperial, 93)), it will take up one of the
                  “revealed card slots" in its cost, but be ineligible to be put into your hand by
                  its effect.
                </li>
                <ul>
                  <li>
                    When an event card is played, it is considered to remain in its original zone
                    until its cost has successfully been payed, at which point it gets placed onto
                    the table in a state of “being played" before being placed in its owner’s
                    discard pile after its effects resolve. Therefore, during the payment of the
                    Test of Skill’s cost, it is still on top of your deck and will be revealed as
                    part of the cost of playing the event.
                  </li>
                  <li>
                    While it is already revealed by the Academy or Pillow Book, it can still be
                    revealed again to satisfy its own cost. However, once it leaves the top of your
                    deck (after paying costs and choosing targets in step 5—see ‘Initiating
                    Abilities’ on page 11), it no longer becomes “one of the revealed cards" and
                    cannot be put back into your hand. For more information, see ‘In Play and Out of
                    Play’ on page 10.
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/waning-hostilities`} target="_blank">
                  Waning Hostilities
                </a>
                (100)
              </h5>
              <ul>
                <li>
                  Waning Hostilities limits each player to one conflict opportunity for the phase.
                  Because Waning Hostilities sets a hard limit, no amount of additional conflicts
                  gained through card effects can allow players to declare more than one conflict in
                  that phase.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Elemental Cycle" />
              <h5>
                <a href={`${host}/card/the-mirror-s-gaze`} target="_blank">
                  The Mirror's Gaze
                </a>
                (15)
              </h5>
              <ul>
                <li>
                  The Mirror’s Gaze cannot be used to copy interrupts or reactions whose effects
                  cancel a card effect or framework step.
                </li>
                <ul>
                  <li>
                    The following cards are some examples of some events that cannot by copied by
                    this attachment for this reason: Voice of Honor (Core, 145), Display of Power
                    (Core, 179), Forged Edict (Core, 184), Censure (Imperial Cycle, 60)
                  </li>
                </ul>
                <li>
                  The Mirror’s Gaze cannot be used to copy events whose effects reference their
                  triggering conditions (which are ignored).
                </li>
                <ul>
                  <li>
                    The following cards are some examples of some events that cannot be copied by
                    this attachment for this reason: Indomitable Will (Core, 158), Ready for Battle
                    (Core, 165), I Can Swim (Core, 187), Way of the Chrysanthemum (Imperial Cycle,
                    80)
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/master-alchemist`} target="_blank">
                  Master Alchemist
                </a>
                (44)
              </h5>
              <ul>
                <li>
                  Master Alchemist can be used to place fate on the
                  <span className="icon icon-element-fire" /> ring while it is contested or claimed.
                  Fate will stay on rings up until the point at which they become contested. If the
                  ring is already being contested when fate is added to it, the attacker will not
                  gain that fate.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Children of the Empire" />
              <h5>
                <a href={`${host}/card/kakita-toshimoko`} target="_blank">
                  Kakita Toshimoko
                </a>
                (14)
              </h5>
              <ul>
                <li>
                  If a participating character’s skill values are dependent upon players’ honor
                  bids, Kakita Toshimoko’s interrupt ability can alter the calculation of skill
                  totals in step 3.2.3 before fully resolving that step by changing those players’
                  bids and potentially changing which player wins or loses the conflict due to the
                  change in skill values.
                </li>
                <ul>
                  <li>
                    Because interrupts resolve before their triggering condition (page 11), and
                    because “would" effects have the capability to change the triggering condition
                    (page 20), Toshimoko’s ability has the potential to change the outcome of step
                    3.2.3. Therefore, if: a character’s skill values are dependent upon the players’
                    honor bids, Toshimoko’s duel changes those bids, and he loses the duel, then it
                    is possible that Toshimoko could lose the duel but win the conflict (if up
                    against a Sincere Challenger (Children of the Empire, 27) who loses composure in
                    a political conflict, for example, or by being honored by Kyūden Kakita (Masters
                    of the Court, 1)). It is also possible that recalculating skill values for step
                    3.2.3 due to Toshimoko’s ability could cause a province that would originally be
                    breaking to no longer be breaking if the loss of skill (or increase of
                    Toshimoko’s skill) causes the attacking player to not have the excess skill
                    necessary to cause the province to break.
                  </li>
                </ul>
              </ul>
              <h5>
                <a href={`${host}/card/unmatched-expertise`} target="_blank">
                  Unmatched Expertise
                </a>
                (65)
              </h5>
              <ul>
                <li>
                  If a character “cannot receive dishonored status tokens," then those tokens cannot
                  be placed on or moved to that character. That character cannot be dishonored if it
                  is ordinary. (See page 32.)
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Inheritance Cycle" />
              <h5>
                <a href={`${host}/card/command-respect`} target="_blank">
                  Command Respect
                </a>
                (18)
              </h5>
              <ul>
                <li>
                  When an event card is played, it is considered to still be in its owner’s hand
                  while determining whether a card’s play restrictions are met. Command Respect
                  cannot be played if both players have the same number of cards in hand.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/akodo-kaede`} target="_blank">
                  Akodo Kaede
                </a>
                (28)
              </h5>
              <ul>
                <li>
                  Akodo Kaede’s effect can prevent a character from being sacrificed. (See Reprieve,
                  page 29)
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/steward-of-the-rich-frog`} target="_blank">
                  Steward of the Rich Frog
                </a>
                (54)
              </h5>
              <ul>
                <li>
                  When an event card is played, it is considered to still be in its owner’s hand
                  until after all costs and selections have been made.
                </li>
                <ul>
                  <li>
                    While choosing targets during Step 5 of the process of playing For Shame (Core,
                    207) on a Steward of the Rich Frog, the Steward’s text prevents characters from
                    receiving dishonored status tokens. Because selecting options happens during the
                    same step as choosing targets, the For Shame is still in the opponent’s hand
                    when the selection is made, and an option whose effect would fail to change the
                    game state cannot be selected.
                  </li>
                </ul>
                <li>
                  If a character “cannot receive dishonored status tokens," then those tokens cannot
                  be placed on or moved to that character. That character cannot be dishonored if it
                  is ordinary.
                </li>
              </ul>
              <AnchoredHeading addHeading={addHeading} level="2" text="Dominion Cycle" />
              <h5>
                <a href={`${host}/card/seven-stings-keep`} target="_blank">
                  Seven Stings Keep
                </a>
                (25)
              </h5>
              <ul>
                <li>
                  <p>
                    When resolving this stronghold’s ability, the process of declaring a conflict is
                    inverted. The conflict begins with the declaration of defenders, which means the
                    defending characters will be participating in the conflict before the attacking
                    characters are declared (and before there is an attacked province, a conflict
                    type, or a contested ring). Because there is no conflict type when defenders are
                    declared, any character may be declared as a defender. If the conflict type
                    chosen by the attacking player would result in an ineligible defender—for
                    example, because the defender has a dash skill value for the declared conflict
                    type—then that character moves home bowed.
                  </p>
                  <p>
                    When declaring attackers, the attacking player must choose a number of attacking
                    characters equal to the number chosen when paying the cost of Seven Stings
                    Keep’s ability. If a number was chosen greater than the number of eligible
                    attackers, the attacking player must declare the greatest number of possible
                    attackers. This may force the attacking player to select a particular ring or
                    conflict type to make the declaration of the required number of attackers
                    eligible. For example, if a character has a dash{' '}
                    <span className="icon icon-conflict-military" /> skill value and it must be
                    declared to reach the chosen number of attackers, then a{' '}
                    <span className="icon icon-conflict-political" /> conflict must be declared.
                  </p>
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/retire-to-the-brotherhood`} target="_blank">
                  Retire to the Brotherhood
                </a>
                (28)
              </h5>
              <ul>
                <li>
                  If a player reveals their entire deck and does not reveal a number of characters
                  equal to the number of characters they discarded to this province’s effect, they
                  do not reshuffle their discard pile to keep revealing more cards. They only put
                  into play the characters revealed, even though this results in fewer characters
                  entering play than the number of characters that were discarded.
                </li>
                <li>
                  If a player reveals multiple copies of a unique character to this province’s
                  effect, or reveals a unique character already in play that they own or control,
                  they do not put the duplicate(s) into play. They do not reveal or put into play
                  any additional characters to make up for the unique characters that could not
                  enter play.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/silent-ones-monastery`} target="_blank">
                  Silent Ones Monastery
                </a>
                (50)
              </h5>
              <ul>
                <li>
                  When a player would gain more than 2 honor per phase due to honor being
                  transferred between players, such as by an honor bid, the Silent Ones Monastery
                  prevents all but 2 of it. The honor is not lost by the player giving honor because
                  it is not gained by the player who would be gaining honor.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/study-the-natural-world`} target="_blank">
                  Study the Natural World
                </a>
                (68)
              </h5>
              <ul>
                <li>
                  The effect of this event adds the element(s) of the attacked province to the
                  contested ring immediately and creates a delayed effect that allows the attacking
                  player to resolve each of the contested ring’s effects if they win the conflict.
                  This delayed effect occurs during step 3.2.3 of conflict resolution, at which
                  point the attacking player may either resolve all of the contested ring’s effects
                  or none of them. It does not replace framework step 3.2.6, when the attacking
                  player may also resolve [b]one[/b] of the contested ring’s effects as normal.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/under-siege`} target="_blank">
                  Under Siege
                </a>
                (89)
              </h5>
              <ul>
                <li>
                  If the defending player has no cards in their hand, this card cannot be played.as
                  normal.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/foothills-keep`} target="_blank">
                  Foothills Keep
                </a>
                (94)
              </h5>
              <ul>
                <li>
                  When paying the additional cost for attacking a province other than Foothills
                  Keep, fate cannot be spent to the ring selected to be the contested ring as the
                  conflict is declared.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/contested-countryside`} target="_blank">
                  Contested Countryside
                </a>
                (106)
              </h5>
              <ul>
                <li>
                  All ability limits are player-specific, so this holding allows the attacking
                  player to trigger the attacked province’s abilities, even if the defending player
                  also triggers those abilities.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/divine-ancestry`} target="_blank">
                  Divine Ancestry
                </a>
                (110)
              </h5>
              <ul>
                <li>
                  If you cannot lose honor, you cannot give honor to an opponent (and they cannot
                  take honor from you). Any card effect or framework step that would require the
                  transfer of honor is ignored.
                </li>
              </ul>
              <h5>
                <a href={`${host}/card/compromised-secrets`} target="_blank">
                  Compromised Secrets
                </a>
                (135)
              </h5>
              <ul>
                <li>
                  If the attached character has a forced ability, that ability gains the additional
                  cost of giving the opponent 1 honor. Because the ability is forced, it must be
                  triggered and therefore the costs (giving the opponent 1 honor) must be paid.
                </li>
                <li>
                  If Compromised Secrets and the character it is attached to are both controlled by
                  the same player, the additional cost to trigger the character’s abilities would
                  require a player to give themself 1 honor. Because a player cannot give themself 1
                  honor, the additional cost cannot be paid, and therefore the abilities cannot be
                  triggered.
                </li>
              </ul>
            </section>
            <section>
              <AnchoredHeading addHeading={addHeading} level="1" text="Appendix IV: Card Errata" />
              <p>
                This section contains the official errata that have been made on individual cards in{' '}
                <i>Legend of the Five Rings: The Card Game</i>. Errata overrides the originally
                printed information on the card it applies to. Unless errata for a card appears
                below, the original English printing of that card and all of its information is
                considered accurate, and overrides all other printings. This includes translated
                cards, promotional cards, and printings which may appear in alternate products.
              </p>
              <h5>
                <a href={`${host}/card/city-of-the-open-hand`} target="_blank">
                  City of the Open Hand
                </a>{' '}
                (Core Set, 6)
              </h5>
              <p>
                Should read: “gain 1 honor.”
                <br />
                <i>(Replaces “take 1 honor from that player.")</i>
              </p>
              <h5>
                <a href={`${host}/card/restoration-of-balance`} target="_blank">
                  Restoration of Balance
                </a>{' '}
                (Core Set, 10)
              </h5>
              <p>
                Should read: “<em>Interrupt</em>: When this province is broken..."
                <br />
                <i>
                  (Replaces “<em>Reaction</em>: After this province is revealed...")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/kuroi-mori`} target="_blank">
                  Kuroi Mori
                </a>{' '}
                (Core Set, 12)
              </h5>
              <p>
                Should read: “Cannot be a stronghold province.”
                <br />
                <i>(Added “Cannot be a stronghold province.”)</i>
              </p>
              <h5>
                <a href={`${host}/card/against-the-waves`} target="_blank">
                  Against the Waves
                </a>{' '}
                (Core Set, 117)
              </h5>
              <p>
                Should read: "Choose a <b>Shugenja</b> character you control." <br />
                <i>(Added "you control")</i>
              </p>
              <h5>
                <a href={`${host}/card/kyuden-isawa`} target="_blank">
                  Kyūden Isawa
                </a>{' '}
                (Disciples of the Void, 1)
              </h5>
              <p>
                Should read: "During a conflict, bow this stronghold and discard a<b>Spell</b> event
                from your hand" <br />
                <i>
                  (Added "and discard a <b>Spell</b> event from your hand")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/kaito-kosori`} target="_blank">
                  Kaito Kosori
                </a>{' '}
                (Disciples of the Void, 18)
              </h5>
              <p>
                Should read: "During each
                <span className="icon icon-element-air" /> conflict, if you control at least 1
                participating character and if this character is in your home area and ready, it
                contributes its skill to your side." <br />
                <i>(Added "and ready.")</i>
              </p>
              <h5>
                <a href={`${host}/card/yogo-kikuyo`} target="_blank">
                  Yogo Kikuyo
                </a>{' '}
                (Disciples of the Void, 25)
              </h5>
              <p>
                Should read: "When the effects of a <em>Spell</em> event your opponent plays during
                a conflict would initiate, put this character into play from your hand – cancel its
                effects." <br />
                <i>(Added "from your hand.")</i>
              </p>
              <h5>
                <a href={`${host}/card/daidoji-uji`} target="_blank">
                  Daidoji Uji
                </a>{' '}
                (Masters of the Court, 11)
              </h5>
              <p>
                Should read: "While this character is honored, you may play each character in your
                provinces as if it were in your hand."
                <br />
                <i>(Removed "reducing its cost by 1.")</i>
              </p>
              <h5>
                <a href={`${host}/card/those-who-serve`} target="_blank">
                  Those Who Serve
                </a>{' '}
                (The Emperor's Legion, 28)
              </h5>
              <p>
                Should read: “(to a minimum of 1).”
                <br />
                <i>(Replaces “(to a minimum of 0).”)</i>
              </p>
              <h5>
                <a href={`${host}/card/kaiu-shihobu`} target="_blank">
                  Kaiu Shihobu
                </a>{' '}
                (Defenders of Rokugan, 10)
              </h5>
              <p>
                Should read: "Put a facedown holding under your stronghold province into play in an
                unbroken non-stronghold province..."
                <br />
                <i>
                  Replaces “Put a facedown holding under your stronghold province into an unbroken
                  non-stronghold province...")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/feast-or-famine`} target="_blank">
                  Feast or Famine
                </a>{' '}
                (Imperial Cycle, 41)
              </h5>
              <p>
                Should read: “...move 1 fate from that character to a character you control."
                <br />
                <i>
                  (Replaces “move each fate from that character to a character you control with no
                  fate.")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/hawk-tattoo`} target="_blank">
                  Hawk Tattoo
                </a>{' '}
                (Elemental Cycle, 75)
              </h5>
              <p>
                Should read: "Attach to a character you control."
                <br />
                <i>(Added "Attach to a character you control.")</i>
              </p>
              <h5>
                <a href={`${host}/card/stay-your-hand`} target="_blank">
                  Stay Your Hand
                </a>{' '}
                (Children of the Empire, 80)
              </h5>
              <p>
                Should read: “When a duel that targets a character you control would resolve"
                <br />
                <i>
                  (Replaces “When an opponent initiates a duel that targets a character you
                  control")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/butcher-of-the-fallen`} target="_blank">
                  Butcher of the Fallen
                </a>{' '}
                (Dominion Cycle, 31)
              </h5>
              <p>
                Should read: “While this character is attacking, characters with less{' '}
                <span className="icon icon-conflict-military" /> skill than the number of unbroken
                provinces you control cannot be declared as defenders.”
                <br />
                <i>
                  (Replaces “While this character is attacking, characters with printed{' '}
                  <span className="icon icon-conflict-military" /> skill X or less cannot be
                  declared as defenders, where X is the number of unbroken provinces you control.”)
                </i>
              </p>
              <h5>
                <a href={`${host}/card/stoke-insurrection`} target="_blank">
                  Stoke Insurrection
                </a>{' '}
                (Dominion Cycle, 113)
              </h5>
              <p>
                Should read: “During a conflict – reveal each facedown card in your opponent’s
                provinces. Then, put up to 2 characters with total printed cost 6 or lower from
                their provinces into play...”
                <br />
                <i>
                  (Replaces “While this character is attacking, characters with printed  skill X or
                  less cannot be declared as defenders, where X is the number of unbroken provinces
                  you control.”)
                </i>
              </p>
              <h5>
                <a href={`${host}/card/unbridled-ambition`} target="_blank">
                  Unbridled Ambition
                </a>{' '}
                (Dominion Cycle, 116)
              </h5>
              <p>
                Should read: “Cannot be a stronghold province.”
                <br />
                <i>(Added “Cannot be a stronghold province.”)</i>
              </p>
              <AnchoredHeading addHeading={addHeading} level="2" text="Reprint Changes" />
              <p>
                The following errata clarifies the interaction between individual card text and the
                rules in this document, based on the current card ability templating. These text
                changes will be reflected in any future printing of the card, whether in reprints of
                existing product, promotional printings, and new printings in future products.
              </p>
              <h5>Prononuns (All cards)</h5>
              <p>
                All instances of “he or she" that appear on existing cards will be reprinted with
                the singular “they" pronoun.
              </p>
              <h5>“As if you were the attacking player" (All cards)</h5>
              <p>
                All instances of the phrase “as if you were the attacking player" printed on cards
                that resolve ring effects will be removed on future reprints.
              </p>
              <h5>“Initiate a [type] duel" (Characters and attachments)</h5>
              <p>
                All instances of the phrase “initiate a [type] duel" printed on character and
                attachment cards should read: “this character initiates a [type] duel."
              </p>
              <h5>
                <a href={`${host}/card/keeper-initiate`} target="_blank">
                  Keeper Initiate
                </a>{' '}
                (Core, 124)
              </h5>
              <p>
                Should read: “If you do, place 1 fate on this character."
                <br />
                <i>(Replaces “Then, put 1 fate on this character")</i>
              </p>
              <h5>
                <a href={`${host}/card/wandering-ronin`} target="_blank">
                  Wandering Ronin
                </a>{' '}
                (Core, 127)
              </h5>
              <p>
                The title should be spelled Wandering Rōnin.
                <br />
                Should have the Rōnin trait. <br />
                <i>(Updated the spelling of the title and trait.)</i>
              </p>
              <h5>
                <a href={`${host}/card/steward-of-law`} target="_blank">
                  Steward of Law
                </a>{' '}
                (Core, 139)
              </h5>
              <p>
                Should read: “...characters cannot receive dishonored status tokens."
                <br />
                <i>(Replaces “...characters cannot become dishonored.")</i>
              </p>
              <h5>
                <a href={`${host}/card/kitsuki-shomon`} target="_blank">
                  Kitsuki Shomon
                </a>{' '}
                (Underhand of the Emperor, 13)
              </h5>
              <p>
                Should read: “If you do, ready this character."
                <br />
                <i>(Replaces “Then, ready this character")</i>
              </p>
              <h5>
                <a href={`${host}/card/the-spear-rushes-forth`} target="_blank">
                  The Spear Rushes Forth
                </a>{' '}
                (Masters of the Court, 23)
              </h5>
              <p>
                Should read: “discard an honored status token"
                <br />
                <i>(Replaces “discard an honor token")</i>
              </p>
              <h5>
                <a href={`${host}/card/prepare-for-war`} target="_blank">
                  Prepare for War
                </a>{' '}
                (The Emperor's Legion, 25)
              </h5>
              <p>
                Should read: “Then, if that character is a <em>Commander</em>..."
                <br />
                <i>(Added “Then,")</i>
              </p>
              <h5>
                <a href={`${host}/card/hida-sukune`} target="_blank">
                  Hida Sukune
                </a>{' '}
                (Defenders of Rokugan, 5)
              </h5>
              <p>
                Should read: “draw 1 card, then discard 1 card from your hand. (Limit once per
                conflict.)"
                <br />
                <i>
                  (Replaces “draw 1 card and discard 1 card from your hand. (Limit once per
                  conflict.)")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/river-of-the-last-stand`} target="_blank">
                  River of the Last Stand
                </a>{' '}
                (Defenders of Rokugan, 14)
              </h5>
              <p>
                Should read: “your opponent discards 2 random cards from their hand, then draws 1
                card."
                <br />
                <i>
                  (Replaces “your opponent discards 2 random cards from his or her hand and draws 1
                  card.")
                </i>
              </p>
              <h5>
                <a href={`${host}/card/kaiu-inventor`} target="_blank">
                  Kaiu Inventor
                </a>{' '}
                (Imperial Cycle, 63)
              </h5>
              <p>
                Should read: "...an additional time this round (or specified period)."
                <br />
                <i>(Changed "each" to "this")</i>
              </p>
              <h5>
                <a href={`${host}/card/pit-trap`} target="_blank">
                  Pit Trap
                </a>{' '}
                (Imperial Cycle, 73)
              </h5>
              <p>
                Should read: “Play only on an attacking character. Attached character does not ready
                during the fate phase.”
                <br />
                <i>
                  (Replaces “Attach to an attacking character. Attached character does not ready
                  during the regroup phase.”)
                </i>
              </p>
              <h5>
                <a href={`${host}/card/ride-them-down`} target="_blank">
                  Ride Them Down
                </a>{' '}
                (Imperial Cycle, 99)
              </h5>
              <p>
                Should read: "...set the base strength of the attacked province to 1 until the end
                of the conflict."
                <br />
                <i>(Added "until the end of the conflict.")</i>
              </p>
              <h5>
                <a href={`${host}/card/oracle-of-stone`} target="_blank">
                  Oracle of Stone
                </a>{' '}
                (Elemental Cycle, 37)
              </h5>
              <p>
                Should read: “Then, each player discards 2 cards from his or her hand."
                <br />
                <i>(Added “from his or her hand.")</i>
              </p>
              <h5>
                <a href={`${host}/card/ikebana-artisan`} target="_blank">
                  Ikebana Artisan
                </a>{' '}
                (Elemental Cycle, 63)
              </h5>
              <p>
                The text after the dash should read: “cancel that honor loss. Then, lose 1 fate.
                (Unlimited.)"
                <br />
                <i>(Replaces “lose 1 fate instead. (Unlimited.)")</i>
              </p>
              <h5>
                <a href={`${host}/card/hidden-moon-dojo`} target="_blank">
                  Hidden Moon Dojo
                </a>{' '}
                (Elemental Cycle, 68)
              </h5>
              <p>
                The title should be spelled Hidden Moon Dōjō.
                <br />
                Should have the <b>Dōjō</b> trait. <br />
                <i>(Updated the spelling of the title and trait.)</i>
              </p>
              <h5>
                <a href={`${host}/card/mantra-of-earth`} target="_blank">
                  Mantra of Earth
                </a>{' '}
                (Elemental Cycle, 116)
              </h5>
              <p>
                Should read: “opponents’ card abilities cannot choose that character as a target."
                <br />
                <i>(Replaces “opponents’ card effects cannot target that character.")</i>
              </p>
              <h5>
                <a href={`${host}/card/paragon-of-grace`} target="_blank">
                  Paragon of Grace
                </a>{' '}
                (Children of the Empire, 13)
              </h5>
              <p>
                Should read: “During a conflict in which this character is participating on your
                side alone"
                <br />
                <i>(Added “on your side")</i>
              </p>
              <h5>
                <a href={`${host}/card/sage-of-gisei-toshi`} target="_blank">
                  Sage of Gisei Toshi
                </a>{' '}
                (Children of the Empire, 28)
              </h5>
              <p>
                Should read: “If you do, move that character home."
                <br />
                <i>(“Then, move that character home.")</i>
              </p>
              <h5>
                <a href={`${host}/card/hand-to-hand`} target="_blank">
                  Hand to Hand
                </a>{' '}
                (Children of the Empire, 13)
              </h5>
              <p>
                Should read: “If you do, move that character home."
                <br />
                <i>(Replaces “Then, move that character home.")</i>
              </p>
              <h5>
                <a href={`${host}/card/unmatched-expertise`} target="_blank">
                  Unmatched Expertise
                </a>{' '}
                (Children of the Empire, 65)
              </h5>
              <p>
                Should read: “Attached character cannot receive dishonored status tokens."
                <br />
                <i>(Replaces “Attached character cannot become dishonored.")</i>
              </p>
              <h5>
                <a href={`${host}/card/ide-ryoma`} target="_blank">
                  Ide Ryōma
                </a>{' '}
                (Inheritance Cycle, 79)
              </h5>
              <p>
                Should read: “If you do, ready the other."
                <br />
                <i>(Replaces “Then, ready the other.")</i>
              </p>
              <h5>
                <a href={`${host}/card/regal-bearing`} target="_blank">
                  Regal Bearing
                </a>{' '}
                (Inheritance Cycle, 84)
              </h5>
              <p>
                Should read: “Set the bid on your honor dial to 1. Then, draw cards..."
                <br />
                <i>(Replaces “Set the bid on your honor dial to 1 and draw cards...")</i>
              </p>
              <h5>
                <a href={`${host}/card/expert-interpreter`} target="_blank">
                  Expert Interpreter
                </a>{' '}
                (Clan War, 45)
              </h5>
              <p>
                Should read: “during each conflict in which one of the chosen rings is contested
                this phase..."
                <br />
                <i>(Added “this phase")</i>
              </p>
              <h5>
                <a href={`${host}/card/spectral-visitation`} target="_blank">
                  Spectral Visitation
                </a>{' '}
                (Dominion Cycle, 68)
              </h5>
              <p>
                Should read: “After this province is revealed – discard the top 4 cards of your
                dynasty deck. Then, choose a character in your dynasty discard pile and put that
                character into play.”
                <br />
                <i>
                  (Moved the phrase “Discard the top 4 cards of your dynasty deck. Then, discard the
                  choose a character in your dynasty discard pile” from before the dash to after the
                  dash.)
                </i>
              </p>
              <h5>
                <a href={`${host}/card/study-the-natural-world`} target="_blank">
                  Study the Natural World
                </a>{' '}
                (Dominion Cycle, 68)
              </h5>
              <p>
                Should read: “the contested ring gains each of the attacked province’s elements
                until the end of the conflict.”
                <br />
                <i>(Added “until the end of the conflict”)</i>
              </p>
              <h5>
                <a href={`${host}/card/exposed-courtyard`} target="_blank">
                  Exposed Courtyard
                </a>{' '}
                (Dominion Cycle, 122)
              </h5>
              <p>
                Should read: “During a <span className="icon icon-conflict-military" /> conflict –
                discard the top 2 cards of your conflict deck. Then, choose an event in your discard
                pile. You may play...” <br />
                <i>
                  (Moved the phrase “Discard the top 2 cards of your conflict deck. Then, choose an
                  event in your conflict discard pile” from before the dash to after the dash.)
                </i>
              </p>
            </section>
          </Box>
        </Grid>
        <Grid size={{ sm: 4 }}>
          <Box p={1}>
            {!isSmOrBigger ? (
              <>
                <Fab
                  variant="extended"
                  color={'secondary'}
                  onClick={() => setShowTable(true)}
                  className={classes.fab}
                >
                  <TocIcon style={{ marginRight: '10px' }} />
                  Table of Contents
                </Fab>
                <Dialog open={showTable} keepMounted onClose={() => setShowTable(false)}>
                  <DialogContent>
                    <TableOfContents />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowTable(false)} color="secondary">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            ) : (
              <Box style={{ maxHeight: '93vh', overflow: 'auto' }}>
                <TableOfContents />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Root>
  )
}
