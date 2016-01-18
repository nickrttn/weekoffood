// Menu filtering page
var $grid = $('.recipes').isotope({
  itemSelector: '.recipe',
  layoutMode: 'fitRows'
});

var $checkboxes = $('.filters ul input');

$checkboxes.change(function() {
  // map input values to an array
  var inc = [];

  // filters from checkboxes
  $checkboxes.each(function(i, el) {
    // check if checked
    if (el.checked) {
      inc.push(el.value);
    }
  });

  // combine inclusive filters
  var filterValue = inc.length ? inc.join(', ') : '*';

  $grid.isotope({ filter: function(){
    return filterValue === '*' ? filterValue : filterValue.match($(this).data('list'));
  }});
});

var $button = $('.filters button[name="randomize"]');
var $recipeContainer = $('.recipes');

$button.on('click', function() {
  var $recipes = $('.recipe:visible');
  $recipes.replaceWith((_.sample($recipes, 5)));
  $grid.isotope();
});

$thisWeekForm = $('.thisweek');

$thisWeekForm.on('submit', function(e) {
  e.preventDefault();
  $recipes = $('.recipe');

  var recipeIds = [];

  _.each($recipes, function(recipe){
    recipeIds.push(($(recipe).data('card')));
  });

  $('input[name="cards"]').val(recipeIds);

  this.submit();
});

// Weekly menu page
var $recipeMain = $('.menu--recipe main');

$recipeMain.hide();

$('.menu--recipe header a').on('click', function(e){
  e.preventDefault();
  $(this).text() == 'Show more' ? $(this).text('Show less') : $(this).text('Show more');
  $(this).parent().siblings('main').toggle();
});
