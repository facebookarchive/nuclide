
while True:
  try:
    x = int(input("Please enter a number: "))
    break
    # except should be in same column as try:
    except ValueError:
    print("Oops!  That was no valid number.  Try again...")


while True:
  try:
    x = int(input("Please enter a number: "))
    break
    # except should be in same column as try:
   except ValueError:
    print("Oops!  That was no valid number.  Try again...")

class B(Exception):
  pass

class C(B):
  pass

class D(C):
  pass

for cls in [B, C, D]:
  try:
    raise cls()
  except D:
    print("D")
  except C:
    print("C")
    # except should be in same level as except
    except B:
    print("B")


for cls in [B, C, D]:
  try:
    raise cls()
  except D:
    print("D")
  except C:
    print("C")
    # except should be in same level as except
   except B:
    print("B")

for arg in sys.argv[1:]:
  try:
    f = open(arg, 'r')
    #except should be in same level as try
    except IOError:
    print('cannot open', arg)
  else:
    print(arg, 'has', len(f.readlines()), 'lines')
    f.close()

for arg in sys.argv[1:]:
  try:
    f = open(arg, 'r')
    #except should be in same level as try
   except IOError:
    print('cannot open', arg)
  else:
    print(arg, 'has', len(f.readlines()), 'lines')
    f.close()

for arg in sys.argv[1:]:
  try:
    f = open(arg, 'r')
  except IOError:
    print('cannot open', arg)
    #else should be in same level as try
    else:
    print(arg, 'has', len(f.readlines()), 'lines')
    f.close()

for arg in sys.argv[1:]:
  try:
    f = open(arg, 'r')
  except IOError:
    print('cannot open', arg)
    #else should be in same level as try
   else:
    print(arg, 'has', len(f.readlines()), 'lines')
    f.close()

def minus():
  while True:
    try:
      x = int(input("Please enter a number: "))
      break
      #except should be in same level as try:
      except ValueError:
      print("Oops!  That was no valid number.  Try again...")

def minus():
  while True:
    try:
      x = int(input("Please enter a number: "))
      break
      #except should be in same level as try:
     except ValueError:
      print("Oops!  That was no valid number.  Try again...")

  
def zero():
  for cls in [B, C, D]:
    try:
      raise cls()
      #except should be in same level as try:
      except D:
      print("D")
    except C:
      print("C")
    except B:
      print("B")
  
def zero():
  for cls in [B, C, D]:
    try:
      raise cls()
    except D:
      print("D")
      #except should be in same level as try:
     except C:
      print("C")
    except B:
      print("B")
      
def one():
  import sys

  try:
    f = open('myfile.txt')
    s = f.readline()
    i = int(s.strip())
  except OSError as err:
    print("OS error: {0}".format(err))
    # except should be in same level as except
    except ValueError:
    print("Could not convert data to an integer.")
  except:
    print("Unexpected error:", sys.exc_info()[0])
    raise  
      
def one():
  import sys

  try:
    f = open('myfile.txt')
    s = f.readline()
    i = int(s.strip())
    # except should be in same level as except
   except OSError as err:
    print("OS error: {0}".format(err))
  except ValueError:
    print("Could not convert data to an integer.")
  except:
    print("Unexpected error:", sys.exc_info()[0])
    raise  

def two():
  for arg in sys.argv[1:]:
    try:
      f = open(arg, 'r')
    except IOError:
      print('cannot open', arg)
      # else should be in same level as except
      else:
      print(arg, 'has', len(f.readlines()), 'lines')
      f.close()      

def two():
  for arg in sys.argv[1:]:
    try:
      f = open(arg, 'r')
    except IOError:
      print('cannot open', arg)
      # else should be in same level as except
     else:
      print(arg, 'has', len(f.readlines()), 'lines')
      f.close()      

def divide(x, y):
  try:
    result = x / y
  except ZeroDivisionError:
    print("division by zero!")
  else:
    print("result is", result)
    # finally should be in same level as except
    finally:
    print("executing finally clause")      

def divide(x, y):
  try:
    result = x / y
  except ZeroDivisionError:
    print("division by zero!")
  else:
    print("result is", result)
    # finally should be in same level as except
   finally:
    print("executing finally clause")      