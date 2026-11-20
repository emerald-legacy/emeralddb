// Decks, decklists and comments referred to their users by Auth0 id (user_id), and the
// API sent that id out with every deck. Users get a random public_id instead, and the
// three tables refer to it (owner_id, author_id). The Auth0 id stays in users only.
//
// Knex runs each migration in a transaction, so a failure leaves the database unchanged.

exports.up = async function (knex) {
  // Fail fast instead of waiting for locks (e.g. an open psql session); a long wait
  // would block every request on these tables and could exceed the dyno boot timeout
  await knex.raw(`SET LOCAL lock_timeout = '5s'`)
  await checkPreconditions(knex)

  // gen_random_uuid() is built into Postgres 13+; every existing user gets its own value
  await knex.raw(`
    ALTER TABLE users ADD COLUMN public_id uuid NOT NULL DEFAULT gen_random_uuid();
    ALTER TABLE users ADD CONSTRAINT users_public_id_unique UNIQUE (public_id);
  `)

  await knex.raw(`
    ALTER TABLE decks ADD COLUMN owner_id uuid;
    UPDATE decks SET owner_id = users.public_id FROM users WHERE users.id = decks.user_id;
    ALTER TABLE decks ALTER COLUMN owner_id SET NOT NULL;
    ALTER TABLE decks ADD CONSTRAINT decks_owner_id_foreign
      FOREIGN KEY (owner_id) REFERENCES users (public_id);
    -- Target of the composite foreign key from decklists below
    ALTER TABLE decks ADD CONSTRAINT decks_id_owner_id_unique UNIQUE (id, owner_id);
    CREATE INDEX decks_owner_id_index ON decks (owner_id);
    ALTER TABLE decks DROP COLUMN user_id;
  `)

  // A deck has one owner, and every version of it belongs to that owner. decklists.user_id
  // was nullable, and createDecklist didn't check the deck, so some versions had no user
  // or someone else's; they now all belong to the deck's owner. The composite foreign key
  // keeps decklists.owner_id equal to the deck's owner from now on.
  await knex.raw(`
    ALTER TABLE decklists ADD COLUMN owner_id uuid;
    UPDATE decklists SET owner_id = decks.owner_id FROM decks WHERE decks.id = decklists.deck_id;
    ALTER TABLE decklists ALTER COLUMN owner_id SET NOT NULL;
    ALTER TABLE decklists ADD CONSTRAINT decklists_deck_id_owner_id_foreign
      FOREIGN KEY (deck_id, owner_id) REFERENCES decks (id, owner_id);
    ALTER TABLE decklists DROP COLUMN user_id;
  `)

  await knex.raw(`
    ALTER TABLE decklist_comments ADD COLUMN author_id uuid;
    UPDATE decklist_comments SET author_id = users.public_id
      FROM users WHERE users.id = decklist_comments.user_id;
    ALTER TABLE decklist_comments ALTER COLUMN author_id SET NOT NULL;
    ALTER TABLE decklist_comments ADD CONSTRAINT decklist_comments_author_id_foreign
      FOREIGN KEY (author_id) REFERENCES users (public_id);
    ALTER TABLE decklist_comments DROP COLUMN user_id;
  `)
}

// The foreign keys of the old schema guarantee that every row finds its user. Check it
// anyway, so a database that drifted from the migrations fails with a clear message
// instead of a NOT NULL violation halfway through.
async function checkPreconditions(knex) {
  const {
    rows: [counts],
  } = await knex.raw(`
    SELECT
      current_setting('server_version_num')::int AS server_version,
      (SELECT count(*) FROM decks
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = decks.user_id))::int AS decks,
      (SELECT count(*) FROM decklists
        WHERE NOT EXISTS (
          SELECT 1 FROM decks JOIN users ON users.id = decks.user_id
          WHERE decks.id = decklists.deck_id))::int AS decklists,
      (SELECT count(*) FROM decklist_comments
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = decklist_comments.user_id))::int
        AS comments
  `)
  if (counts.server_version < 130000) {
    throw new Error(`Postgres 13 or newer is needed (gen_random_uuid), this is ${counts.server_version}`)
  }
  const { decks, decklists, comments } = counts
  if (decks + decklists + comments > 0) {
    throw new Error(
      `Rows without a user: ${decks} decks, ${decklists} decklists (via their deck), ` +
        `${comments} comments. Fix or delete them before migrating.`
    )
  }
}

// Restores the user_id columns with their original types and constraints. Decklists get
// the Auth0 id of their deck's owner, also those that had none or another user's before.
exports.down = async function (knex) {
  await knex.raw(`SET LOCAL lock_timeout = '5s'`)

  await knex.raw(`
    ALTER TABLE decklist_comments ADD COLUMN user_id varchar(255);
    UPDATE decklist_comments SET user_id = users.id
      FROM users WHERE users.public_id = decklist_comments.author_id;
    ALTER TABLE decklist_comments ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE decklist_comments ADD CONSTRAINT decklist_comments_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users (id);
    ALTER TABLE decklist_comments DROP COLUMN author_id;
  `)

  await knex.raw(`
    ALTER TABLE decklists ADD COLUMN user_id varchar(255);
    UPDATE decklists SET user_id = users.id FROM users WHERE users.public_id = decklists.owner_id;
    ALTER TABLE decklists ADD CONSTRAINT decklists_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users (id);
    ALTER TABLE decklists DROP COLUMN owner_id;
  `)

  await knex.raw(`
    ALTER TABLE decks ADD COLUMN user_id varchar(255);
    UPDATE decks SET user_id = users.id FROM users WHERE users.public_id = decks.owner_id;
    ALTER TABLE decks ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE decks ADD CONSTRAINT decks_user_id_foreign
      FOREIGN KEY (user_id) REFERENCES users (id);
    ALTER TABLE decks DROP COLUMN owner_id;
  `)

  await knex.raw(`ALTER TABLE users DROP COLUMN public_id;`)
}
