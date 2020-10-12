using System;

public class HelloWorld
{
  public static void Main(string[] args)
  {
    Console.Write("Hello DotNet World");
    if (args.Length > 0) {
      Console.WriteLine(", arguments passed");
      string filename = args[0];
      if (System.IO.File.Exists(filename)) {
        Console.Write(System.IO.File.ReadAllText(args[0]));
      } else {
        Console.Write("ERROR: could not open file");
      }
    }
    Console.WriteLine("");
  }
}
