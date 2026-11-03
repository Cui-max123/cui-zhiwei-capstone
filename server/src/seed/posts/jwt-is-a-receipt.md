# A JWT is a receipt, not a session

The first time I added authentication to an API, I thought the token *was* the session. I stored it in `localStorage`, put it in every request, and assumed that logging out meant deleting the string. It worked. It was also wrong in a way that took me a while to see.

A JSON Web Token is a signed receipt. It says: *this server issued this claim, at this time, to this subject.* It does not say the subject is still allowed to do anything. That distinction is the whole security model.

## What the token actually contains

A JWT has three parts: a header, a payload and a signature. The payload is not encrypted. Anyone holding the token can read it. The signature only proves the server created it and nobody changed it.

~~~js
jwt.sign(
  { sub: user.id },
  process.env.JWT_SECRET,
  { algorithm: 'HS256', expiresIn: '7d', issuer: 'portfolio-api' }
);
~~~

That means a token should contain identifiers, not secrets. Never put a password, an email address you would not publish, or a role you have not verified on the server into a token and then trust it forever.

## The two checks

Every protected request needs two separate checks:

1. **Is this receipt genuine and current?** Verify the signature, the issuer, the audience and the expiry.
2. **Is this subject still allowed to do this?** Load the user and check the role or ownership on the current record.

The second check is the one people skip. A token issued to an admin last week should not let that account edit a project after the role has been removed. Reading the user from the database on each request costs one query; it also makes revocation possible.

~~~js
const payload = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'portfolio-api',
  audience: 'portfolio-client'
});

const user = await User.findById(payload.sub);
if (!user) throw new ApiError(401, 'Account no longer exists');
~~~

## Logout is a client promise

With a stateless JWT, `logout` is mostly a promise the client makes to itself: it deletes the token and stops sending it. The server cannot un-issue a signed token unless it keeps a denylist or a token version. For a course project, that is an acceptable trade-off if you say so out loud.

If I needed real logout on every device, I would add a `tokenVersion` field to the user. Signing includes the current version; incrementing it invalidates every older token. That is a small amount of state for a large amount of control.

## What I do now

- Access tokens are short-lived: minutes, not weeks.
- Refresh tokens live in an `HttpOnly` cookie, never in JavaScript-readable storage.
- The server checks the user and the permission on every write.
- The client treats a `401` as "session over" and clears its state once, in one place.

The receipt is useful. It is not the whole transaction. The difference between those two ideas is where most auth bugs live.
