import { useSession, getSession, signOut } from 'next-auth/client'
import { connectToDatabase } from "../lib/mongodb"
import Image from 'next/image'
import Main from '../components/Main'
const { ObjectId } = require('mongodb')

const Account = (props) => {

  const [session, loading] = useSession()
  const onboardings = JSON.parse(props.onboardings)
  const applications = JSON.parse(props.applications)
  const inquiries = JSON.parse(props.inquiries)

  const convertDate = (timestamp) => {
    return new Date(timestamp)
      .toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
  }

  return (
    <>
      {loading && <div className='text-center'>Loading...</div>}

      {session &&

        <Main title='My Account' titleSuffix={true}>
          <div className="flex flex-col items-center justify-center my-16 px-8">

            {session.user.image &&
              <div className="flex flex-row gap-8 shadow-md p-8 mb-6">
                <Image
                  src={session.user.image}
                  width={200}
                  height={200}
                  alt="Avatar"
                />
                <div>
                  <h1 className="mb-2">Welcome {session.user.name}</h1>
                  <p className="mb-8">{session.user.email}</p>
                </div>
              </div>
            }

            <h2 className="text-xl text-brand mb-4">{inquiries && inquiries.length ? `Your open inquiries:` : ``}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {inquiries.map((inquiry, index) => (
                <div className="my-8 px-8 py-4 border border-gray-200 bg-gray-50 rounded relative grid gap-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" key={index}>
                  <span className="absolute -top-6 text-xs text-gray-600">{convertDate(inquiry.createdAt)}</span>

                  {Object.entries(inquiry).map(([key, value]) => (
                    <div className="px-4 py-2 bg-white" key={key}>
                      <p className="capitalize text-xs border-b">{key}</p>
                      <p className="pt-2">{value}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <h2 className="text-xl text-brand mb-4">{applications && applications.length ? `Your current applications:` : ``}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {applications.map((application, index) => (
                <div className="my-8 px-8 py-4 border border-gray-200 bg-gray-50 rounded relative grid gap-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" key={index}>
                  <span className="absolute -top-6 text-xs text-gray-600">{convertDate(application.createdAt)}</span>

                  {
                    Object.entries(application).map(([key, value]) => (
                      <div className="px-4 py-2 bg-white" key={key}>
                        <p className="capitalize text-xs border-b">{key}</p>
                        <p className="pt-2">{value}</p>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>

            <h2 className="text-xl text-brand mb-4">{onboardings && onboardings.length ? `Your current onboardings:` : ``}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {onboardings.map((onboarding, index) => (
                <div className="my-8 px-8 py-4 border border-gray-200 bg-gray-50 rounded relative grid gap-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" key={index}>
                  <span className="absolute -top-6 text-xs text-gray-600">{convertDate(onboarding.createdAt)}</span>

                  {
                    Object.entries(onboarding).map(([key, value]) => (
                      <div className="px-4 py-2 bg-white" key={key}>
                        <p className="capitalize text-xs border-b">{key}</p>
                        <p className="pt-2">{value}</p>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => signOut()} className='navbar-link m-auto flex my-6'>
            Sign out
          </button>
        </Main >
      }
    </>
  )
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(ctx) {

  const { db } = await connectToDatabase()
  const session = await getSession(ctx)

  // Redirect to home when not logged in
  if (!session) {
    ctx.res.setHeader("location", "/")
    ctx.res.statusCode = 302
    ctx.res.end()
    return { props: {} }
  }

  const user = await db
    .collection("users")
    .findOne(ObjectId(session.user.id))

  const inquiries = await db
    .collection("inquiries")
    .find({ "_userId": ObjectId(session.user.id) })
    .toArray()

  const applications = await db
    .collection("applications")
    .find({ "_userId": ObjectId(session.user.id) })
    .toArray()

  const onboardings = await db
    .collection("onboardings")
    .find({ "_userId": ObjectId(session.user.id) })
    .toArray()

  return {
    props: {
      session: await getSession(ctx),
      user: JSON.stringify(user),
      inquiries: JSON.stringify(inquiries),
      applications: JSON.stringify(applications),
      onboardings: JSON.stringify(onboardings),
    }
  }
}

export default Account
