import * as model from './model.js'
import  {MODAL_CLOSE_SEC} from './config.js'
import recipeView from './views/recipeview.js'
import SearchView from './views/searchview.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime'
import { async } from 'regenerator-runtime'

// https://forkify-api.herokuapp.com/v2

// if(module.hot) {
//   module.hot.accept()
// }

async function controlRecipes () {
  try {
    const id = window.location.hash.slice(1)

    if (!id) return;
    recipeView.renderSpinner()

    // 1) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    // 2) Updating bookmarksView
    bookmarksView.update(model.state.bookmarks)
    
    // 3) LOADING RECIPE
    await model.loadRecipe(id)
    
    // 4) RENDERING RECIPE
    recipeView.render(model.state.recipe)


  } catch (err) {
    recipeView.renderError()
    console.error(err);
  }
}



const controlSearchResults = async function () {
  try{
    resultsView.renderSpinner()

    // 1) Get search query
    const query = SearchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.log(err);
  }
}

const controlPagination = function(goToPage) {
   // 3) Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 4) Render NEW pagination buttons
    paginationView.render(model.state.search)
}

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings)

  // Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}


const controlAddBookMark = function() {
  // 1) Add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe)
  else model.deleteBookMark(model.state.recipe.id)
  
  // 2) Update recipe view
  recipeView.update(model.state.recipe)

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}


const controlBookMarks = function() {
  bookmarksView.render(model.state.bookmarks)
}


const controlAddRecipe = async function(newRecipe) {
  try{
    // Show loading spinner
    addRecipeView.renderSpinner()

    // UPLOAD THE NEW RECIPE DATA
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);

    // Render recipe 
    recipeView.render(model.state.recipe)

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks)

    // Change ID in URL
    window.history.pushState(null, '' , `#${model.state.recipe.id}`);
    // window.history.back()

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)

  } catch(err) {
    console.error('💥', err)
    addRecipeView.renderError(err.message)
  }

}



const init = function () {
  bookmarksView.addHandlerRender(controlBookMarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerBookmark(controlAddBookMark)
  SearchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView._addHandlerUpload(controlAddRecipe)
}
init()


