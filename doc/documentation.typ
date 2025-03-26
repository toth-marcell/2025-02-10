#let title = "A project with login and database"
#let author = "Tóth Marcell"
#let ps = 12.5pt
#set document(title: title, author: author)
#set page(footer: context align(center)[#here().page() / #counter(page).final().first()])
#set text(ps, font: "Noto Serif")
#align(center)[
  #text(1.4em)[* #title *]

  _ #author _
]
#show heading.where(level: 1): set text(1.4 * ps)
#show heading.where(level: 2): set text(1.1 * ps)
#show raw.where(block: true): it => block(it, fill: color.hsl(0deg, 0%, 0%, 5%), inset: 1em)
#show raw: set text(font: "Hack")
#outline()
#show heading.where(level: 1): it => {
  pagebreak()
  it
}
= Javascript backend
== Database design
#{
  show table: set align(center)
  grid(
    columns: 2,
    gutter: 2cm,
    table(
      [*User*],
      [id],
      [name],
      [password],
      [createdAt],
      [updatedAt],
    ),
    table(
      [*Person*],
      [id],
      [name],
      [age],
      [createdAt],
      [updatedAt],
    ),
  )
}
== NPM Dependencies
#json("../package.json").dependencies.keys().join(", ")
== Running the backend
The `.env` file must be set up with the port and jwt secret, such as:
```env
PORT=8080
SECRET=é
```
The port defaults to 8080 if not set, the secret must be set.
Then, do an npm install and run the backend with `node server.js`.

The API is then accessible at `/api` on the chosen port.
== The website
There's also a web interface, but it only has the ability to create accounts/login and list current users, as it was not part of this task.
== Backend routes
All API routes return 200 when successful,
500 in case of server error,
and user error is handled using this utility function which return status code 400:
```js
function APIError(req, res, msg) {
  res.status(400);
  res.json({ msg: msg });
}
```
=== POST /login
Expects name and password in request body. If login successful, returns json with token and name fields.
=== POST /register
Same as login, but for creating a new account.
=== GET /profiles
Returns a JSON list containing names and account creation times of all accounts.
=== GET /person
Returns all data about all people.
=== POST /person
Expects name and age in body, creates a new person and returns its details.
=== DELETE /person
Expects a person id in the query string and deletes it.
=== PUT /person
Expects id, name and age in body and updates the person with that id using the name and age provided.
=== DELETE /deleteall
Deletes all users.
= C\# WPF desktop program
== Graphical interface
#image("desktop.png")
The left side of the main window is for the login system.
The list of existing accounts is shown here.
Clicking the "login or register" button opens a window to log in or register:
#image("desktop_login.png", width: 50%)
#image("desktop_loggedin.png", width: 40%)
The right side is for viewing, deleting, and creating people in the database.
The lower part has a button for deleting all people and a form to add new ones.
The upper part has a datagrid that displays data about the people in the database.
Each entry has button for deleting it and one which opens up a window to edit it:
#image("desktop_edit.png")
== Classes
The following classes are defined in the desktop program for storing information:

=== User
Represents a user for the account list.
```cs
public class User
{
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
```
=== LoginBody
Represents the request body when sending a login or register request.
```cs
public class LoginBody
{
    public string name { get; set; }
    public string password { get; set; }
    public LoginBody(string name, string password)
    {
        this.name = name;
        this.password = password;
    }
}
```
=== APIError
Represents the error JSON that is sent by the server.
```cs
public class APIError
{
    public string Msg { get; set; }
}
```
=== LoggedInUser
Represents the response from the server after a successful login, the currently logged in user has this type.
```cs
public class LoggedInUser
{
    public string Name { get; set; }
    public string Token { get; set; }
}
```
=== Person
Represents a person for the person datagrid and associated functions.
```cs
public class Person
{
    public int id { get; set; }
    public string name { get; set; }
    public int age { get; set; }
    public Person(string name, int age)
    {
        this.name = name;
        this.age = age;
    }
}
```
== The API static class
The `API` static class provides functions for interacting with the API.
The URL which the API is available at is set here.
```cs
static readonly string URL = "http://localhost:8080/api";
```
The login and register functions share code, only their path is different. If the server response is not successful, these raise an error with the error message being the one sent by the server.
```cs
public static async Task LoginOrRegister(string path, string name, string password);
public static async Task Login(string name, string password) => await LoginOrRegister("/login", name, password);
public static async Task Register(string name, string password) => await LoginOrRegister("/register", name, password);
```
It also has the methods for interacting with the people table with following prototypes:
```cs
public static async Task<List<Person>> GetPeople();
public static async Task NewPerson(string name, int age);
public static async Task DeletePerson(int id);
public static async Task DeleteAllPeople();
public static async Task EditPerson(int id, string name, int age);
```
The various events in the graphical interface call these methods.
These also have the ability to raise errors with the error message sent by the server, but the backend currently doesn't have checks (like for empty names).
