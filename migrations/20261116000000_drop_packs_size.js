// packs.size was never kept up to date. The pack size is computed from
// cards_in_packs (see getAllPacks/getPack), so the column is dropped.
exports.up = function (knex) {
  return knex.schema.alterTable('packs', function (table) {
    table.dropColumn('size')
  })
}

// Restores the column, but not its (stale) values
exports.down = function (knex) {
  return knex.schema.alterTable('packs', function (table) {
    table.integer('size')
  })
}
