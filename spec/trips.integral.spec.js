describe('bar', function() {

  var trips = [];

  beforeEach(function(){
    browser.get('http://localhost:8000/#/register');
    element(by.model('user.username')).sendKeys("username");
    element(by.model('user.password')).sendKeys("password");
    element(by.buttonText('Register')).click();
  });

  it('should show empty list of trips', function() {
    trips = element.all(by.repeater('trip in trips'));
    expect(trips.count()).toEqual(0);
  });

  it('should add new trip', function() {
    element(by.model('name')).sendKeys("New Trip");
    element(by.model('description')).sendKeys("description");
    element(by.model('dateOfDeparture')).sendKeys("2015-06-21");
    element(by.model('arrivalDate')).sendKeys("2015-07-21");
    element(by.buttonText('Add Trip')).click();

    trips = element.all(by.repeater('trip in trips'));
    expect(trips.count()).toEqual(1);
    expect(element(by.model('name')).getText()).toEqual("");
  });
});