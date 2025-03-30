import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Footer from "@/components/footer";
import EditorNav from "@/components/loggedin-nav";

export default function Loading() {
  return (
    <section>
      <EditorNav />

      <div className="flex flex-col w-full min-h-screen bg-black">
        <div className="flex flex-col h-full">
          <div className="flex justify-center w-full mt-20">
            <div className="container lg:px-5 px-3">
              <div className="w-full flex justify-end pb-3">
                <div className="flex items-center justify-center space-x-2 pb-2 bg-black animate-pulse">
                  <div className="w-[332px] h-8 bg-neutral-500 rounded" />
                </div>
              </div>

              <Table>
                <TableCaption>
                  <div className="flex items-center justify-center p-4 bg-black animate-pulse delay-1000">
                    <div className="w-[200px] h-4 bg-neutral-500 rounded" />
                  </div>
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex flex-row gap-2 items-center justify-between pt-3 pb-3">
                        <div className="flex items-center justify-center bg-black animate-pulse delay-100">
                          <div className="w-[100px] h-4 pb-2 bg-neutral-500 rounded" />
                        </div>
                        <div className="flex items-center justify-center bg-black animate-pulse delay-100">
                          <div className="w-[100px] h-4 pb-2 bg-neutral-500 rounded" />
                        </div>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <TableRow key={idx} className="hover:bg-white/15 ">
                      <TableCell
                        key={idx}
                        className="flex flex-row items-center space-x-6 gap-6 p-6 bg-black animate-pulse"
                        style={{
                          animationDelay: `${idx * 100 + 200}ms`,
                        }}
                      >
                        <div className="flex-1 h-4 w-full bg-neutral-500 rounded" />
                        <div className="w-40 h-4 bg-neutral-500 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </section>
  );
}
