# The admin dashboard is the real product

A portfolio has two audiences. Visitors see the finished project. You see the dashboard you use to put it there. If the second one is bad, the first one slowly becomes a museum of things you stopped updating.

I learned this while building the admin area for this site. The public pages were fun: big type, careful spacing, a hero that finally looked right. The dashboard was a form in a `<div>`. I told myself it was internal, so it did not need design. Then I avoided using it.

## Internal tools deserve a point of view

The dashboard does not need to be beautiful in the same way as the public site. It does need to be fast, predictable and honest about state. The three things that helped most were boring:

- **One screen per job.** Projects, posts, messages and skills are separate tabs. I stopped trying to make a single page that did everything.
- **A visible saving state.** Every button disables while its request is in flight, and every result becomes a toast. No "did that work?" clicks.
- **Delete confirmation that names the thing.** "Delete project?" is easy to click through. "Delete *Meridian*?" is not.

## Optimistic UI is not always kind

I tried updating the list before the server replied. It felt instant. It also lied when a request failed, and then I had to write code to put the old row back. For a dashboard used by one person, a 200 ms spinner is more honest than a fake success.

The pattern I use now is simple: send, wait, replace the row with the server's response, show a toast. If the request fails, nothing in the UI changes except the error. That is a feature.

## The empty state is part of the form

An empty table with a "New" button is fine. An empty table that explains what will appear, and why it matters, is better. My messages tab says: "Messages from the contact form land here. Nothing yet." That sentence has saved me more confusion than any tooltip.

## Build the dashboard first

If I started this project again, I would build the admin CRUD before the public pages. It forces the data model to be real. It exposes the fields that are annoying to edit, the required values that should be optional, and the validation that only exists in the form. The public site is a presentation of decisions; the dashboard is where those decisions get made.

The public site is what visitors judge. The dashboard is what determines whether there is anything worth judging.
