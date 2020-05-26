# VTEX Search Resolver Template

This app is an example implementation of the [VTEX Search Protocol](https://github.com/vtex-apps/search-graphql) that wraps API calls related to search on Store Framework. It's inspired by the [`vtex.search-resolver@1.x`](https://github.com/vtex-apps/search-resolver/tree/v1.x) code, which relies on Biggy's external API. **Notice that we've left some of the custom algorithms** creates to integrate with Biggy, since it'll probably be useful when integrating with any other engine.

## Creating a custom integration

- To integrate an external search engine into VTEX, clone this repository and change the resolvers' code on `node`.
- To test, run `vtex link` in a workspace. Make sure that **there's no other app implementing Search Protocol installed!**.

## Keep in mind
- Entries and files with `customSearchEngine` **should be modified and renamed** accordingly to the search engine to be integrated.
- The main file to look at is `node/resolvers/search/index.ts`, where is implemented resolvers for search-related queries. It's important to notice that some resolvers **will not be modified** since they're connecting directly to VTEX APIs. This will be addressed on future releases of VTEX Search Protocol, but shouldn't introduce breaking changes.
- It's important to **adapt the Typescript types** into the code, since they're probably specific to Biggy.