# What MongoDB taught me about modelling uncertainty

Most of my early schemas were guesses wearing a suit. I wrote down the fields I could see in the UI, called the result "the data model", and then spent the next month adding fields for everything I had forgotten. MongoDB did not punish me for that. That was the problem.

In a relational database, a new nullable column is a small ceremony. In MongoDB, I could add a key to one document and not another, and the application would keep running. That flexibility is real, but it is not free. It moves the cost from the migration to every place that reads the data.

## The schema is a promise

A Mongoose schema is not a description of what is in the database today. It is a promise about what the application is allowed to read tomorrow. If `project.summary` can be missing, every component that renders a summary needs a fallback. If `summary` is required, only one place needs to enforce it.

I now write the schema twice. First as the shape I wish the data had, then as the shape it actually has after a few weeks of real use. The gap between the two is the work.

~~~js
const projectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, maxlength: 260 },
  techStack: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['shipped', 'in-progress', 'concept'],
    default: 'concept'
  }
});
~~~

The enum is the part I care about most. `status` is not decoration. It is an honest statement about how far a project got. A portfolio full of "live" badges that link to nothing is worse than one that says "concept" out loud.

## Three questions I ask before adding a field

1. **Is this a fact or a view?** A project's `title` is a fact. Its "completion percentage" is a view. Store facts; compute views.
2. **Will it change independently?** If a value changes for reasons unrelated to its parent, it probably wants its own collection. Comments are not an array on a post; they are records with their own authors and timestamps.
3. **Can I explain the default?** A default is a policy. If a post is `published: true` by default, I am saying every draft is public until someone remembers to change it. That is a bad policy. Defaults should fail closed.

## Relationships are not joins in disguise

Mongoose's `populate` is convenient, and that convenience hides a query. A blog list that populates an author looks like one operation. It is two. A list that populates authors and comment counts can become three or four.

I stopped pretending otherwise and made the cost visible:

~~~js
const posts = await Post.find({ published: true })
  .populate('author', 'username')
  .lean();

const counts = await Comment.aggregate([
  { $match: { post: { $in: posts.map((post) => post._id) } } },
  { $group: { _id: '$post', count: { $sum: 1 } } }
]);
~~~

Two queries, no N+1, and the code says what it does. `lean()` is also a small honesty check: if I do not need a Mongoose document, I should not pay for one.

## The database is part of the interface

The most useful change I made was to treat the API response as a product surface. The client should not have to know that `author` is an ObjectId sometimes and a populated object other times. Pick one shape, document it, and keep it stable. Every inconsistency you leave in the API becomes a conditional in the UI.

MongoDB is excellent at absorbing change. A good schema makes sure the change happens in one place, on purpose, with a test that proves it.
