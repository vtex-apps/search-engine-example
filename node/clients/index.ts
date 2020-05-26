import { IOClients } from '@vtex/api'

import { Search } from './search'
import { Checkout } from './checkout'
import { customSearchEngineClient } from './customEngine'

/**
 * On this file you'll name and export the custom clients created by this app. 
 * 
 * The Search and Checkout clients will be used to connect with VTEX APIs, and the customSearchEngine with the API to be integrated.
 */
export class Clients extends IOClients {
  public get search() {
    return this.getOrSet('search', Search)
  }
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
  public get customSearchEngine() {
    return this.getOrSet('customSearchEngine', customSearchEngineClient)
  }
}
